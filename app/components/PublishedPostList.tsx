import type { PublishedPostSummary } from "../lib/public-posts";
import { categoryLabel, topicLabel } from "../lib/post-taxonomy";
import { techCollectionLabel } from "../content/tech";

export function PublishedPostList({ posts, emptyText }: { posts: PublishedPostSummary[]; emptyText?: string }) {
  if (!posts.length) return emptyText ? <p className="published-empty">{emptyText}</p> : null;
  return (
    <div className="published-post-list">
      {posts.map((post, index) => (
        <article key={post.id}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><p>{categoryLabel(post.category)}{post.techCollection ? ` · ${techCollectionLabel(post.techCollection)}` : ""} · {topicLabel(post.topic)} · {formatDate(post.publishedAt ?? post.updatedAt)}</p><h2><a href={`/notes/${post.slug}`}>{post.title}</a></h2><div>{post.excerpt}</div></div>
          <a className="published-post-link" href={`/notes/${post.slug}`} aria-label={`閱讀${post.title}`}>閱讀全文 <span aria-hidden="true">↗</span></a>
        </article>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}
