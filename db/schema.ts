import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""),
    category: text("category").notNull().default("tech"),
    status: text("status").notNull().default("draft"),
    authorGoogleSub: text("author_google_sub").notNull(),
    authorEmail: text("author_email").notNull(),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_posts_slug_unique").on(table.slug),
    index("idx_posts_status_published_at").on(table.status, table.publishedAt),
    index("idx_posts_category_status_published_at").on(table.category, table.status, table.publishedAt),
  ],
);

export const postRevisions = sqliteTable(
  "post_revisions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: text("post_id").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull(),
    createdByGoogleSub: text("created_by_google_sub").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_post_revisions_post_id_created_at").on(table.postId, table.createdAt)],
);

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    postId: text("post_id"),
    objectKey: text("object_key").notNull(),
    originalName: text("original_name").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    altText: text("alt_text").notNull().default(""),
    uploadedByGoogleSub: text("uploaded_by_google_sub").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_media_assets_object_key_unique").on(table.objectKey),
    index("idx_media_assets_post_id").on(table.postId),
  ],
);
