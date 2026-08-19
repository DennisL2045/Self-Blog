import { listPublishedPosts, postCategories, type PostCategory } from "../../lib/posts";

export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("category");
  const category = value && postCategories.includes(value as PostCategory) ? value as PostCategory : undefined;
  try {
    const posts = (await listPublishedPosts(category, 50)).map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    }));
    return Response.json({ posts }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ posts: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
