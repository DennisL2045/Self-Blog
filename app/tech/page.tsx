import Link from "next/link";
import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";
import { techCategories } from "../content/tech";

export const dynamic = "force-dynamic";

export default function TechPage() {
  return (
    <main className="inner-page tech-page">
      <TopBar />
      <section className="tech-hero">
        <p>Knowledge grows quietly</p>
        <h1>技術成長</h1>
        <span>不是背答案，而是把一個概念拆開、實作，再留下能回頭查找的理解。</span>
      </section>
      <section className="tech-category-grid" aria-label="技術分類">
        {techCategories.map((category, index) => (
          <article key={category.slug}>
            <span>0{index + 1}</span>
            <p>{category.english}</p>
            <h2>{category.name}</h2>
            <div>{category.summary}</div>
            <ul>{category.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
          </article>
        ))}
        <Link className="quick-look-entry" href="/tech/quick-look">
          <span>07</span><p>Quick glossary</p><h2>簡單看看</h2>
          <div>從求職網站或職缺描述遇見的工具名詞，用短短幾段先理解它是什麼、何時會用到。</div>
          <b>打開名詞小冊 ↗</b>
        </Link>
      </section>
      <section className="published-tech"><div><p>Growing library</p><h2>技術札記</h2></div><LivePublishedPosts category="tech" emptyText="第一篇技術文章準備中。發布後會依主題顯示在這裡。" /></section>
    </main>
  );
}
