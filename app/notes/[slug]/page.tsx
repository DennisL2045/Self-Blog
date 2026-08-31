import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "../../TopBar";
import { SafeMarkdown } from "../../components/SafeMarkdown";
import { getPublishedPostBySlug } from "../../lib/posts";
import { categoryLabel, topicLabel } from "../../lib/post-taxonomy";
import { techCollectionLabel } from "../../content/tech";
import { postSeoDescription, publicPostExcerpt } from "../../lib/seo";
import { absoluteSiteUrl, authorName, siteName } from "../../lib/site";
import { listPublicPostSummaries } from "../../lib/public-posts";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const post = await getPublishedPostBySlug((await params).slug);
    if (!post) return { title: `找不到文章｜${siteName}`, robots: { index: false, follow: true } };
    const url = `/notes/${post.slug}`;
    const description = postSeoDescription(post);
    return {
      title: `${post.title}｜${siteName}`,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        siteName,
        title: `${post.title}｜${siteName}`,
        description,
        images: [{ url: "/og.png", width: 1733, height: 909, alt: `${post.title}｜${siteName}` }],
        publishedTime: post.publishedAt ?? post.createdAt,
        modifiedTime: post.updatedAt,
        tags: [categoryLabel(post.category), ...(post.techCollection ? [techCollectionLabel(post.techCollection)] : []), topicLabel(post.topic)],
      },
      twitter: { card: "summary_large_image", title: `${post.title}｜${siteName}`, description, images: ["/og.png"] },
    };
  } catch {
    return { title: siteName };
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

  const relatedPosts = await listPublicPostSummaries(post.category, 50, post.techCollection ?? undefined);
  const topicPath = relatedPosts
    .filter((candidate) => candidate.topic.toLocaleLowerCase("en-US") === post.topic.toLocaleLowerCase("en-US"))
    .sort((left, right) => new Date(left.publishedAt ?? left.updatedAt).getTime() - new Date(right.publishedAt ?? right.updatedAt).getTime());
  const topicPosition = topicPath.findIndex((candidate) => candidate.id === post.id);
  const previousPost = topicPosition > 0 ? topicPath[topicPosition - 1] : null;
  const nextPost = topicPosition >= 0 && topicPosition < topicPath.length - 1 ? topicPath[topicPosition + 1] : null;

  const canonicalUrl = absoluteSiteUrl(`/notes/${post.slug}`);
  const categoryUrl = absoluteSiteUrl(categoryHref(post.category));
  const categoryName = categoryLabel(post.category);
  const description = postSeoDescription(post);
  const breadcrumbs = [
    { name: "首頁", url: absoluteSiteUrl() },
    { name: "文章總覽", url: absoluteSiteUrl("/articles") },
    { name: categoryName, url: categoryUrl },
    ...(post.techCollection ? [{ name: techCollectionLabel(post.techCollection), url: absoluteSiteUrl(`/tech/${post.techCollection}`) }] : []),
    { name: post.title, url: canonicalUrl },
  ];
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}#article`,
        headline: post.title,
        description,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        image: [absoluteSiteUrl("/og.png")],
        datePublished: post.publishedAt ?? post.createdAt,
        dateModified: post.updatedAt,
        inLanguage: "zh-Hant",
        articleSection: post.techCollection ? techCollectionLabel(post.techCollection) : categoryName,
        keywords: [categoryName, ...(post.techCollection ? [techCollectionLabel(post.techCollection)] : []), topicLabel(post.topic)],
        author: { "@type": "Person", name: authorName, url: absoluteSiteUrl("/about") },
        publisher: { "@type": "Organization", name: siteName, url: absoluteSiteUrl() },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
    ],
  };

  return (
    <main className="inner-page published-reading-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }} />
      <TopBar />
      <article className="published-reading">
        <nav className="published-breadcrumb" aria-label="文章路徑"><a href="/">首頁</a><span>/</span><a href="/articles">文章總覽</a><span>/</span><a href={categoryHref(post.category)}>{categoryLabel(post.category)}</a>{post.techCollection ? <><span>/</span><a href={`/tech/${post.techCollection}`}>{techCollectionLabel(post.techCollection)}</a></> : null}</nav>
        <header>
          <p>{categoryLabel(post.category)}{post.techCollection ? ` · ${techCollectionLabel(post.techCollection)}` : ""} · {topicLabel(post.topic)}</p>
          <h1>{post.title}</h1>
          <div>{publicPostExcerpt(post)}</div>
          <section className="published-reading-meta" aria-label="文章資訊"><time dateTime={post.publishedAt ?? post.updatedAt}>{formatDate(post.publishedAt ?? post.updatedAt)}</time><span>約 {readingMinutes(post.content)} 分鐘閱讀</span></section>
        </header>
        <SafeMarkdown content={post.content} />
        {previousPost || nextPost ? (
          <aside className="related-reading" aria-labelledby="related-reading-title">
            <header><p>Continue this path</p><h2 id="related-reading-title">沿著 {topicLabel(post.topic)} 繼續讀</h2></header>
            <div>
              {previousPost ? <a href={`/notes/${previousPost.slug}`}><small>先建立前一個概念</small><strong>{previousPost.title}</strong><span>← 閱讀前一篇</span></a> : <span />}
              {nextPost ? <a href={`/notes/${nextPost.slug}`}><small>接著理解下一個概念</small><strong>{nextPost.title}</strong><span>閱讀下一篇 →</span></a> : <span />}
            </div>
          </aside>
        ) : null}
        <footer><a href={post.techCollection ? `/tech/${post.techCollection}` : categoryHref(post.category)}>← 回到{post.techCollection ? techCollectionLabel(post.techCollection) : categoryLabel(post.category)}</a><a href="/articles">查看文章總覽</a><a href="/">返回首頁</a><span>夜行手記 · slowly documented</span></footer>
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
