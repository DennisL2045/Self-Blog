import { headers } from "next/headers";
import type { PostCategory, PostRecord } from "./posts";
import { siteUrl } from "./site";

export type PublishedPostSummary = Pick<PostRecord, "id" | "slug" | "title" | "excerpt" | "category" | "topic" | "publishedAt" | "updatedAt">;

export async function listPublicPostSummaries(category?: PostCategory, limit = 50): Promise<PublishedPostSummary[]> {
  try {
    const incoming = await headers();
    const forwardedHost = incoming.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || incoming.get("host");
    if (!host) return [];
    const canonicalHost = new URL(siteUrl).host;
    const isLocal = host?.startsWith("localhost") || host?.startsWith("127.0.0.1");
    if (isLocal || host !== canonicalHost) return [];
    const { safeListPublishedPosts } = await import("./posts");
    const posts = await safeListPublishedPosts(category, limit);
    return posts.map(({ id, slug, title, excerpt, category: postCategory, topic, publishedAt, updatedAt }) => ({
      id,
      slug,
      title,
      excerpt,
      category: postCategory,
      topic,
      publishedAt,
      updatedAt,
    }));
  } catch {
    return [];
  }
}
