import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "../../TopBar";
import { SafeMarkdown } from "../../components/SafeMarkdown";
import { getPublishedPostBySlug } from "../../lib/posts";
import { categoryLabel, topicLabel } from "../../lib/post-taxonomy";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const post = await getPublishedPostBySlug((await params).slug);
    if (!post) return { title: "找不到札記｜夜行手札" };
    const url = `/notes/${post.slug}`;
    return {
      title: `${post.title}｜夜行手札`,
      description: post.excerpt,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title: post.title,
        description: post.excerpt,
        publishedTime: post.publishedAt ?? post.createdAt,
        modifiedTime: post.updatedAt,
        tags: [categoryLabel(post.category), topicLabel(post.topic)],
      },
    };
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
        <nav className="published-breadcrumb" aria-label="文章路徑"><a href="/">首頁</a><span>/</span><a href="/articles">文章總覽</a><span>/</span><a href={categoryHref(post.category)}>{categoryLabel(post.category)}</a></nav>
        <header>
          <p>{categoryLabel(post.category)} · {topicLabel(post.topic)}</p>
          <h1>{post.title}</h1>
          <div>{post.excerpt}</div>
          <section className="published-reading-meta" aria-label="文章資訊"><time dateTime={post.publishedAt ?? post.updatedAt}>{formatDate(post.publishedAt ?? post.updatedAt)}</time><span>約 {readingMinutes(post.content)} 分鐘閱讀</span></section>
        </header>
        <SafeMarkdown content={post.content} />
        <footer><a href={categoryHref(post.category)}>← 回到{categoryLabel(post.category)}</a><a href="/articles">查看文章總覽</a><a href="/">返回首頁</a><span>夜行手札 · slowly documented</span></footer>
      </article>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

function readingMinutes(content: string) {
  const text = content.replace(/```[\s\S]*?```/g, " ").replace(/[^\p{L}\p{N}\s]/gu, " ");
  const latinWords = text.match(/[a-z0-9]+/gi)?.length ?? 0;
  const hanCharacters = text.match(/[\p{Script=Han}]/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(latinWords / 180 + hanCharacters / 400));
}

function categoryHref(category: string) {
  if (category === "tech") return "/tech";
  if (category === "quick-look") return "/tech/quick-look";
  if (category === "experience") return "/experience";
  if (category === "travel") return "/travel";
  return "/articles";
}
