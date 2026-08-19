"use client";

import { useEffect, useState } from "react";
import type { PostCategory, PostRecord } from "../lib/posts";
import { PublishedPostList } from "./PublishedPostList";

export function LivePublishedPosts({ category, emptyText }: { category?: PostCategory; emptyText?: string }) {
  const [posts, setPosts] = useState<PostRecord[]>([]);

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

  return <PublishedPostList posts={posts} emptyText={emptyText} />;
}
