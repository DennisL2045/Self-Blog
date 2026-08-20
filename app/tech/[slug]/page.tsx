import type { Metadata } from "next";
import { TopBar } from "../../TopBar";
import { getTechArticle, techArticles } from "../../content/tech";

export function generateStaticParams() {
  return techArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getTechArticle((await params).slug);
  return article ? { title: `${article.title}｜夜行手札`, description: article.summary } : { title: "找不到札記｜夜行手札" };
}

export default async function TechArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getTechArticle((await params).slug);
  if (!article) return <main className="inner-page"><TopBar /><section className="article-missing"><p>這篇札記暫時不在書架上。</p><a href="/tech">回到技術成長</a></section></main>;

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
