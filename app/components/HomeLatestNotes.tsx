"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PostRecord } from "../lib/posts";

type HomeNote = { date: string; tag: string; title: string; excerpt: string; href: string };

export function HomeLatestNotes({ fallback }: { fallback: HomeNote[] }) {
  const [notes, setNotes] = useState(fallback);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/posts", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("request_failed");
        return await response.json() as { posts?: PostRecord[] };
      })
      .then((data) => {
        if (!data.posts?.length) return;
        const live = data.posts.slice(0, 3).map((post) => ({
          date: new Intl.DateTimeFormat("zh-TW", { month: "2-digit", day: "2-digit" }).format(new Date(post.publishedAt ?? post.updatedAt)),
          tag: post.category === "tech" ? "技術成長" : post.category === "quick-look" ? "簡單看看" : post.category === "experience" ? "個人經歷" : "出遊手札",
          title: post.title,
          excerpt: post.excerpt,
          href: `/notes/${post.slug}`,
        }));
        setNotes([...live, ...fallback].slice(0, 3));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [fallback]);

  return <div className="note-list">{notes.map((note, index) => (
    <article className="note" key={`${note.href}-${note.title}`}>
      <span className="note-index">0{index + 1}</span>
      <div><p className="note-meta"><time>{note.date}</time> · {note.tag}</p><h3><Link href={note.href}>{note.title}</Link></h3><p>{note.excerpt}</p></div>
      <span className="note-arrow" aria-hidden="true">↗</span>
    </article>
  ))}</div>;
}
