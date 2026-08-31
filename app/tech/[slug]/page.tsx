import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "../../TopBar";
import { PaginatedPostList } from "../../components/PaginatedPostList";
import { SeriesNav } from "../../components/SeriesNav";
import { getTechArticle, getTechCategory, techArticles, techCategories } from "../../content/tech";
import { listPublicPostSummaries } from "../../lib/public-posts";
import { publicPostExcerpt } from "../../lib/seo";
import { siteName } from "../../lib/site";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [...techCategories.map((category) => ({ slug: category.slug })), ...techArticles.map((article) => ({ slug: article.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const category = getTechCategory(slug);
  if (category) {
    const posts = await listPublicPostSummaries("tech", 1, category.slug);
    return {
      title: `${category.name}｜技術成長｜${siteName}`,
      description: `${category.summary}收錄 ${category.topics.join("、")}等主題的概念整理與實作筆記。`,
      alternates: { canonical: `/tech/${category.slug}` },
      robots: posts.length ? undefined : { index: false, follow: true },
    };
  }
  const article = getTechArticle(slug);
  return article ? { title: `${article.title}｜${siteName}`, description: article.summary } : { title: `找不到文章｜${siteName}`, robots: { index: false, follow: true } };
}

export default async function TechArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const category = getTechCategory(slug);
  if (category) {
    const posts = await listPublicPostSummaries("tech", 50, category.slug);
    const javascriptPosts = category.slug === "web-development"
      ? posts
        .filter((post) => post.topic.toLocaleLowerCase("en-US") === "javascript")
        .sort((left, right) => new Date(left.publishedAt ?? left.updatedAt).getTime() - new Date(right.publishedAt ?? right.updatedAt).getTime())
      : [];
    return (
      <main className="inner-page tech-page tech-collection-page">
        <TopBar />
        <section className="inner-content">
          <header className="collection-hero">
            <h1>{category.name}</h1>
            <div><p>{category.english}</p><span>{category.summary}</span></div>
          </header>
          <SeriesNav current="tech" />
          {javascriptPosts.length > 1 ? (
            <section className="javascript-path" aria-labelledby="javascript-path-title">
              <header>
                <div><p>JavaScript learning path</p><h2 id="javascript-path-title">JavaScript 基礎路線</h2></div>
                <span>不另外拆出重複分類；依照概念之間的關係，從變數一路讀到函式如何保留外部狀態。</span>
              </header>
              <ol>
                {javascriptPosts.map((post, index) => (
                  <li key={post.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><h3><a href={`/notes/${post.slug}`}>{post.title}</a></h3><p>{publicPostExcerpt(post)}</p></div>
                    <a href={`/notes/${post.slug}`} aria-label={`閱讀${post.title}`}>閱讀 <b aria-hidden="true">↗</b></a>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          <section className="collection-article-list" aria-labelledby="collection-articles-title">
            <header className="collection-article-heading">
              <h2 id="collection-articles-title">{category.name}文章</h2>
              <div><p>Filed notes</p><span>{category.topics.join("、")}</span></div>
            </header>
            <PaginatedPostList posts={posts} emptyText={`「${category.name}」目前還沒有公開文章。`} />
          </section>
          <footer className="collection-footer"><a href="/tech">← 回到全部技術分類</a><a href="/articles">文章總覽</a><a href="/">返回首頁</a></footer>
        </section>
      </main>
    );
  }

  const article = getTechArticle(slug);
  if (!article) notFound();

  return (
    <main className="inner-page tech-reading-page">
      <TopBar />
      <article className="tech-reading">
        <header>
          <p>{article.categoryName} · {article.level}</p>
          <h1>{article.title}</h1>
          <div>{article.summary}</div>
          <ul><li>{article.readingTime}</li><li>更新 {article.updatedAt}</li>{article.tags.map((tag) => <li key={tag}>#{tag}</li>)}</ul>
        </header>
        <div className="reading-body">
          <aside><span>Contents</span>{article.sections.map((section, index) => <a href={`#section-${index + 1}`} key={section.heading}>{String(index + 1).padStart(2, "0")} {section.heading}</a>)}</aside>
          <div className="reading-sections">
            {article.sections.map((section, index) => (
              <section id={`section-${index + 1}`} key={section.heading}>
                <span>{String(index + 1).padStart(2, "0")}</span><h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.code && <div className="code-block"><small>{section.language}</small><pre><code>{section.code}</code></pre></div>}
                {section.callout && <blockquote>{section.callout}</blockquote>}
              </section>
            ))}
          </div>
        </div>
        <footer className="reading-footer"><a href="/tech">← 回到技術成長</a><a href="/articles">文章總覽</a><a href="/">返回首頁</a><span>理解不必一次完成，留下能繼續追問的地方。</span></footer>
      </article>
    </main>
  );
}
