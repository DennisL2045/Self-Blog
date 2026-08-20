import { listPublishedPosts, postCategories, type PostCategory } from "../../lib/posts";
import { techCollections, type TechCollection } from "../../content/tech";

export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("category");
  const category = value && postCategories.includes(value as PostCategory) ? value as PostCategory : undefined;
  const collectionValue = new URL(request.url).searchParams.get("collection");
  const techCollection = collectionValue && techCollections.includes(collectionValue as TechCollection) ? collectionValue as TechCollection : undefined;
  try {
    const posts = (await listPublishedPosts(category, 50, techCollection)).map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      techCollection: post.techCollection,
      topic: post.topic,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    }));
    return Response.json({ posts }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ posts: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
