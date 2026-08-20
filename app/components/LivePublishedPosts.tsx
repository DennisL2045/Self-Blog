import type { PostCategory, TechCollection } from "../lib/posts";
import { listPublicPostSummaries } from "../lib/public-posts";
import { PublishedPostList } from "./PublishedPostList";

export async function LivePublishedPosts({ category, techCollection, emptyText }: { category?: PostCategory; techCollection?: TechCollection; emptyText?: string }) {
  const posts = await listPublicPostSummaries(category, 50, techCollection);
  return <PublishedPostList posts={posts} emptyText={emptyText} />;
}
