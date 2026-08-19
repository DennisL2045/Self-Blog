import type { PostCategory } from "../lib/posts";
import { listPublicPostSummaries } from "../lib/public-posts";
import { PublishedPostList } from "./PublishedPostList";

export async function LivePublishedPosts({ category, emptyText }: { category?: PostCategory; emptyText?: string }) {
  const posts = await listPublicPostSummaries(category, 50);
  return <PublishedPostList posts={posts} emptyText={emptyText} />;
}
