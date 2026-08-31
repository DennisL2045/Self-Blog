import type { Metadata } from "next";
import { TopBar } from "../TopBar";
import { PaginatedPostList } from "../components/PaginatedPostList";
import { SeriesNav } from "../components/SeriesNav";
import { techCategories } from "../content/tech";
import { listPublicPostSummaries } from "../lib/public-posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "技術成長｜JavaScript、前後端與系統開發筆記｜夜行手記",
  description: "Dennis 的技術成長筆記，整理 JavaScript、Web 前端、後端資料、程式設計、系統維運與 AI 工程的概念與實作。",
  alternates: { canonical: "/tech" },
};

export default async function TechPage() {
  const posts = await listPublicPostSummaries("tech", 50);
  const articleCounts = new Map<string, number>();
  for (const post of posts) {
    if (post.techCollection) articleCounts.set(post.techCollection, (articleCounts.get(post.techCollection) ?? 0) + 1);
  }

  return (
    <main className="inner-page tech-page">
      <TopBar />
      <section className="tech-hero">
        <p>Knowledge grows quietly</p>
        <h1>技術成長</h1>
        <span>不是背答案，而是把一個概念拆開、實作，再留下能回頭查找的理解。</span>
      </section>
      <SeriesNav current="tech" />
      <section className="tech-category-grid" aria-label="技術分類">
        {techCategories.map((category, index) => (
          <a className="tech-category-card" href={`/tech/${category.slug}`} key={category.slug}>
            <span>0{index + 1}</span>
            <p>{category.english}</p>
            <h2>{category.name}</h2>
            <div>{category.summary}</div>
            <ul>{category.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
            <b>{articleCounts.get(category.slug) ? `查看 ${articleCounts.get(category.slug)} 篇文章` : "查看文章列表"} →</b>
          </a>
        ))}
        <a className="quick-look-entry" href="/tech/quick-look">
          <span>07</span><p>Quick glossary</p><h2>簡單看看</h2>
          <div>從求職網站或職缺描述遇見的工具名詞，用短短幾段先理解它是什麼、何時會用到。</div>
          <b>打開名詞小冊 ↗</b>
        </a>
      </section>
      <section className="published-tech"><div><p>Growing library</p><h2>技術札記</h2></div><PaginatedPostList posts={posts} emptyText="第一篇技術文章準備中。發布後會依主題顯示在這裡。" /></section>
    </main>
  );
}
