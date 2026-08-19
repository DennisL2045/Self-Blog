"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PostRecord } from "../lib/posts";
import { topicLabel } from "../lib/post-taxonomy";

type HomeNote = { date: string; tag: string; title: string; excerpt: string; href: string };

export function HomeLatestNotes() {
  const [notes, setNotes] = useState<HomeNote[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/posts", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("request_failed");
        return await response.json() as { posts?: PostRecord[] };
      })
      .then((data) => {
        const live = (data.posts ?? []).slice(0, 3).map((post) => ({
          date: new Intl.DateTimeFormat("zh-TW", { month: "2-digit", day: "2-digit" }).format(new Date(post.publishedAt ?? post.updatedAt)),
          tag: topicLabel(post.topic),
          title: post.title,
          excerpt: post.excerpt,
          href: `/notes/${post.slug}`,
        }));
        setNotes(live);
      })
      .catch(() => setNotes([]));
    return () => controller.abort();
  }, []);

  if (notes === null) return <p className="home-notes-state">正在看看書架上有沒有新文章…</p>;
  if (!notes.length) return <p className="home-notes-state">第一篇文章準備中。發布後會從這裡開始累積。</p>;

  return <div className="note-list">{notes.map((note, index) => (
    <article className="note" key={`${note.href}-${note.title}`}>
      <span className="note-index">0{index + 1}</span>
      <div><p className="note-meta"><time>{note.date}</time> · {note.tag}</p><h3><Link href={note.href}>{note.title}</Link></h3><p>{note.excerpt}</p></div>
      <span className="note-arrow" aria-hidden="true">↗</span>
    </article>
  ))}</div>;
}
