import Link from "next/link";
import type { PostRecord } from "../lib/posts";
import { categoryLabel, topicLabel } from "../lib/post-taxonomy";

export function PublishedPostList({ posts, emptyText }: { posts: PostRecord[]; emptyText?: string }) {
  if (!posts.length) return emptyText ? <p className="published-empty">{emptyText}</p> : null;
  return (
    <div className="published-post-list">
      {posts.map((post, index) => (
        <article key={post.id}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><p>{categoryLabel(post.category)} · {topicLabel(post.topic)} · {formatDate(post.publishedAt ?? post.updatedAt)}</p><h2><Link href={`/notes/${post.slug}`}>{post.title}</Link></h2><div>{post.excerpt}</div></div>
          <Link href={`/notes/${post.slug}`} aria-label={`閱讀${post.title}`}>↗</Link>
        </article>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}
