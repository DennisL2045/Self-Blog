import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "../../TopBar";
import { SafeMarkdown } from "../../components/SafeMarkdown";
import { getPublishedPostBySlug } from "../../lib/posts";
import { categoryLabel, topicLabel } from "../../lib/post-taxonomy";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const post = await getPublishedPostBySlug((await params).slug);
    return post ? { title: `${post.title}｜夜行手札`, description: post.excerpt } : { title: "找不到札記｜夜行手札" };
  } catch {
    return { title: "夜行手札" };
  }
}

export default async function PublishedNotePage({ params }: { params: Promise<{ slug: string }> }) {
  let post;
  try {
    post = await getPublishedPostBySlug((await params).slug);
  } catch {
    post = null;
  }
  if (!post) notFound();

  return (
    <main className="inner-page published-reading-page">
      <TopBar />
      <article className="published-reading">
        <header><p>{categoryLabel(post.category)} · {topicLabel(post.topic)}</p><h1>{post.title}</h1><div>{post.excerpt}</div><time>{formatDate(post.publishedAt ?? post.updatedAt)}</time></header>
        <SafeMarkdown content={post.content} />
        <footer><Link href="/notes">← 回到所有札記</Link><span>夜行手札 · slowly documented</span></footer>
      </article>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}
