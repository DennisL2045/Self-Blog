import { headers } from "next/headers";
import type { PostCategory, PublishedPostSummaryRecord, TechCollection } from "./posts";
import { siteUrl } from "./site";

export type PublishedPostSummary = PublishedPostSummaryRecord;

export async function listPublicPostSummaries(category?: PostCategory, limit = 50, techCollection?: TechCollection): Promise<PublishedPostSummary[]> {
  try {
    const incoming = await headers();
    const forwardedHost = incoming.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || incoming.get("host");
    if (!host) return [];
    const canonicalHost = new URL(siteUrl).host;
    const isLocal = host?.startsWith("localhost") || host?.startsWith("127.0.0.1");
    if (isLocal || host !== canonicalHost) return [];
    const { safeListPublishedPostSummaries } = await import("./posts");
    return safeListPublishedPostSummaries(category, limit, techCollection);
  } catch {
    return [];
  }
}
