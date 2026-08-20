import type { MetadataRoute } from "next";
import { listPublicPostSummaries } from "./lib/public-posts";
import { siteUrl } from "./lib/site";

export const dynamic = "force-dynamic";

const publicRoutes = ["", "/articles", "/tech", "/tech/quick-look", "/experience", "/travel", "/about"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublicPostSummaries(undefined, 500);
  return [
    ...publicRoutes.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly" as const })),
    ...posts.map((post) => ({
      url: `${siteUrl}/notes/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
    })),
  ];
}
