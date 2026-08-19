"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { PostCategory, PostRecord } from "../lib/posts";
import { PublishedPostList } from "./PublishedPostList";

export function LivePublishedPosts({ category, emptyText, fallback = null }: { category?: PostCategory; emptyText?: string; fallback?: ReactNode }) {
  const [posts, setPosts] = useState<PostRecord[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    fetch(`/api/posts${query}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("request_failed");
        return await response.json() as { posts?: PostRecord[] };
      })
      .then((data) => setPosts(data.posts ?? []))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setPosts([]);
      });
    return () => controller.abort();
  }, [category]);

  if (posts === null) return fallback;
  if (!posts.length && fallback) return fallback;
  return <PublishedPostList posts={posts} emptyText={emptyText} />;
}
