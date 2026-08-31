import type { MetadataRoute } from "next";
import { listPublicPostSummaries } from "./lib/public-posts";
import { siteUrl } from "./lib/site";
import { techCategories } from "./content/tech";

export const dynamic = "force-dynamic";

const publicRoutes = ["", "/articles", "/tech", "/tech/quick-look", "/experience", "/travel", "/about"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublicPostSummaries(undefined, 500);
  const publishedTechCollections = new Set(posts.filter((post) => post.category === "tech").map((post) => post.techCollection));
  return [
    ...publicRoutes.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly" as const })),
    ...techCategories
      .filter((category) => publishedTechCollections.has(category.slug))
      .map((category) => ({ url: `${siteUrl}/tech/${category.slug}`, changeFrequency: "weekly" as const })),
    ...posts.map((post) => ({
      url: `${siteUrl}/notes/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
    })),
  ];
}
