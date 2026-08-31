import { listPublicPostSummaries } from "../lib/public-posts";
import { topicLabel } from "../lib/post-taxonomy";
import { publicPostExcerpt } from "../lib/seo";

type HomeNote = { date: string; tag: string; title: string; excerpt: string; href: string };

export async function HomeLatestNotes() {
  const posts = await listPublicPostSummaries(undefined, 3);
  const notes: HomeNote[] = posts.map((post) => ({
    date: new Intl.DateTimeFormat("zh-TW", { month: "2-digit", day: "2-digit" }).format(new Date(post.publishedAt ?? post.updatedAt)),
    tag: topicLabel(post.topic),
    title: post.title,
    excerpt: publicPostExcerpt(post),
    href: `/notes/${post.slug}`,
  }));

  if (!notes.length) return <p className="home-notes-state">第一篇文章準備中。發布後會從這裡開始累積。</p>;

  return <div className="note-list">{notes.map((note, index) => (
    <article className="note" key={`${note.href}-${note.title}`}>
      <span className="note-index">0{index + 1}</span>
      <div><p className="note-meta"><time>{note.date}</time> · {note.tag}</p><h3><a href={note.href}>{note.title}</a></h3><p>{note.excerpt}</p></div>
      <span className="note-arrow" aria-hidden="true">↗</span>
    </article>
  ))}</div>;
}
