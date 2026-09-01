"use client";

import { useMemo, useState } from "react";
import type { PublishedPostSummary } from "../lib/public-posts";
import { topicLabel } from "../lib/post-taxonomy";
import { publicPostExcerpt } from "../lib/seo";
import { PaginatedPostList } from "./PaginatedPostList";

type TopicOption = {
  key: string;
  label: string;
  count: number;
};

export function FilterablePostList({
  posts,
  categoryName,
  preferredTopics = [],
}: {
  posts: PublishedPostSummary[];
  categoryName: string;
  preferredTopics?: readonly string[];
}) {
  const [activeTopic, setActiveTopic] = useState("");
  const [query, setQuery] = useState("");

  const topics = useMemo(() => {
    const usedTopics = new Map<string, TopicOption>();

    for (const post of posts) {
      const key = normalize(post.topic);
      if (!key) continue;
      const existing = usedTopics.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        usedTopics.set(key, { key, label: topicLabel(post.topic), count: 1 });
      }
    }

    const preferredOrder = new Map(preferredTopics.map((topic, index) => [normalize(topic), index]));
    return [...usedTopics.values()].sort((left, right) => {
      const leftOrder = preferredOrder.get(normalize(left.label)) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = preferredOrder.get(normalize(right.label)) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.label.localeCompare(right.label, "zh-TW");
    });
  }, [posts, preferredTopics]);

  const filteredPosts = useMemo(() => {
    const searchTerm = normalize(query);
    return posts.filter((post) => {
      if (activeTopic && normalize(post.topic) !== activeTopic) return false;
      if (!searchTerm) return true;
      return normalize([
        post.title,
        publicPostExcerpt(post),
        post.contentPreview,
        topicLabel(post.topic),
      ].join(" ")).includes(searchTerm);
    });
  }, [activeTopic, posts, query]);

  const activeLabel = topics.find((topic) => topic.key === activeTopic)?.label;
  const emptyText = posts.length === 0
    ? `「${categoryName}」目前還沒有公開文章。`
    : `沒有找到符合目前分類與搜尋條件的文章。`;

  return (
    <div className="collection-browser">
      <div className="collection-topic-tabs" aria-label={`${categoryName}文章系列`}>
        <button
          className={activeTopic === "" ? "active" : ""}
          type="button"
          aria-pressed={activeTopic === ""}
          onClick={() => setActiveTopic("")}
        >
          <span>全部</span><small>{posts.length}</small>
        </button>
        {topics.map((topic) => (
          <button
            className={activeTopic === topic.key ? "active" : ""}
            type="button"
            aria-pressed={activeTopic === topic.key}
            onClick={() => setActiveTopic(topic.key)}
            key={topic.key}
          >
            <span>{topic.label}</span><small>{topic.count}</small>
          </button>
        ))}
      </div>

      <div className="collection-search-row">
        <p aria-live="polite">
          {activeLabel ? `${activeLabel}系列` : "全部文章"}<span>／{filteredPosts.length} 篇</span>
        </p>
        <label className="collection-search">
          <span>搜尋文章</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="輸入標題、摘要或關鍵字"
          />
        </label>
      </div>

      <PaginatedPostList
        key={`${activeTopic}:${normalize(query)}`}
        posts={filteredPosts}
        emptyText={emptyText}
      />
    </div>
  );
}

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-TW").replace(/\s+/g, " ").trim();
}
