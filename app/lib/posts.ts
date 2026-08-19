import { getD1 } from "./runtime";
import type { StudioSession } from "./studio-auth";

export const postCategories = ["tech", "quick-look", "experience", "travel"] as const;
export const postStatuses = ["draft", "published", "archived"] as const;

export type PostCategory = (typeof postCategories)[number];
export type PostStatus = (typeof postStatuses)[number];

export type PostRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  authorGoogleSub: string;
  authorEmail: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  author_google_sub: string;
  author_email: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
};

const SELECT_COLUMNS = `
  id, slug, title, excerpt, content, category, status,
  author_google_sub, author_email, published_at, created_at, updated_at
`;

function toPost(row: PostRow): PostRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category as PostCategory,
    status: row.status as PostStatus,
    authorGoogleSub: row.author_google_sub,
    authorEmail: row.author_email,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listStudioPosts(): Promise<PostRecord[]> {
  const result = await getD1()
    .prepare(`SELECT ${SELECT_COLUMNS} FROM posts ORDER BY updated_at DESC LIMIT 100`)
    .all<PostRow>();
  return result.results.map(toPost);
}

export async function listPublishedPosts(category?: PostCategory, limit = 30): Promise<PostRecord[]> {
  const database = getD1();
  const statement = category
    ? database.prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE status = 'published' AND category = ? ORDER BY published_at DESC LIMIT ?`).bind(category, limit)
    : database.prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ?`).bind(limit);
  const result = await statement.all<PostRow>();
  return result.results.map(toPost);
}

export async function safeListPublishedPosts(category?: PostCategory, limit = 30): Promise<PostRecord[]> {
  try {
    return await listPublishedPosts(category, limit);
  } catch {
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<PostRecord | null> {
  const row = await getD1()
    .prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE slug = ? AND status = 'published' LIMIT 1`)
    .bind(slug)
    .first<PostRow>();
  return row ? toPost(row) : null;
}

export async function createPost(input: PostInput, session: StudioSession): Promise<PostRecord> {
  const database = getD1();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const publishedAt = input.status === "published" ? now : null;
  await database
    .prepare(`
      INSERT INTO posts (
        id, slug, title, excerpt, content, category, status,
        author_google_sub, author_email, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      input.slug,
      input.title,
      input.excerpt,
      input.content,
      input.category,
      input.status,
      session.googleSub,
      session.email,
      publishedAt,
      now,
      now,
    )
    .run();
  return (await getPostById(id))!;
}

export async function updatePost(id: string, input: PostInput, session: StudioSession): Promise<PostRecord | null> {
  const database = getD1();
  const current = await getPostById(id);
  if (!current) return null;
  const now = new Date().toISOString();
  const publishedAt = input.status === "published" ? current.publishedAt ?? now : current.publishedAt;

  await database.batch([
    database.prepare(`
      INSERT INTO post_revisions (
        post_id, title, excerpt, content, category, status,
        created_by_google_sub, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      current.id,
      current.title,
      current.excerpt,
      current.content,
      current.category,
      current.status,
      session.googleSub,
      now,
    ),
    database.prepare(`
      UPDATE posts SET
        slug = ?, title = ?, excerpt = ?, content = ?, category = ?, status = ?,
        author_google_sub = ?, author_email = ?, published_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      input.slug,
      input.title,
      input.excerpt,
      input.content,
      input.category,
      input.status,
      session.googleSub,
      session.email,
      publishedAt,
      now,
      id,
    ),
  ]);

  await linkReferencedMedia(id, input.content, session.googleSub);
  return getPostById(id);
}

export async function archivePost(id: string, session: StudioSession): Promise<PostRecord | null> {
  const current = await getPostById(id);
  if (!current) return null;
  return updatePost(id, { ...current, status: "archived" }, session);
}

export async function getPostById(id: string): Promise<PostRecord | null> {
  const row = await getD1()
    .prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<PostRow>();
  return row ? toPost(row) : null;
}

async function linkReferencedMedia(postId: string, content: string, googleSub: string) {
  const ids = Array.from(content.matchAll(/\/media\/([a-f0-9-]{36})/gi), (match) => match[1]);
  if (!ids.length) return;
  const database = getD1();
  await database.batch(
    [...new Set(ids)].map((id) =>
      database
        .prepare("UPDATE media_assets SET post_id = ? WHERE id = ? AND uploaded_by_google_sub = ?")
        .bind(postId, id, googleSub),
    ),
  );
}

export function normalizePostInput(value: unknown, fallback?: Partial<PostInput>): PostInput {
  const payload = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const title = textValue(payload.title, fallback?.title ?? "未命名札記", 160);
  const excerpt = textValue(payload.excerpt, fallback?.excerpt ?? "", 500);
  const content = textValue(payload.content, fallback?.content ?? "", 200_000, false);
  const category = postCategories.includes(payload.category as PostCategory)
    ? payload.category as PostCategory
    : fallback?.category ?? "tech";
  const status = postStatuses.includes(payload.status as PostStatus)
    ? payload.status as PostStatus
    : fallback?.status ?? "draft";
  const slug = normalizeSlug(typeof payload.slug === "string" ? payload.slug : fallback?.slug ?? "") || makeFallbackSlug();

  if (status === "published" && (!title.trim() || !excerpt.trim() || !content.trim())) {
    throw new Error("發布前需要填寫標題、摘要與內容");
  }
  return { title, slug, excerpt, content, category, status };
}

function textValue(value: unknown, fallback: string, maxLength: number, trim = true) {
  const text = typeof value === "string" ? value : fallback;
  if (text.length > maxLength) throw new Error(`欄位內容超過 ${maxLength} 字元`);
  return trim ? text.trim() : text;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

function makeFallbackSlug() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `note-${date}-${crypto.randomUUID().slice(0, 8)}`;
}
