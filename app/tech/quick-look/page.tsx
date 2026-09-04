import type { Metadata } from "next";
import { TopBar } from "../../TopBar";
import { LivePublishedPosts } from "../../components/LivePublishedPosts";
import { SeriesNav } from "../../components/SeriesNav";
import { quickTerms } from "../../content/tech";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "簡單看看｜開發工具與工程名詞解說｜夜行手記",
  description: "快速理解 Git、Docker、Redis、Nginx、JWT、CI/CD 等開發工具與工程名詞解決的問題及常見使用情境。",
  alternates: { canonical: "/tech/quick-look" },
};

export default function QuickLookPage() {
  return (
    <main className="inner-page quick-page">
      <TopBar />
      <section className="inner-content">
        <header className="inner-heading"><p>Quick glossary</p><h1>簡單看看</h1><span>遇到陌生工具時，不急著鑽進所有細節；先知道他解決什麼問題。</span></header>
        <SeriesNav current="quick-look" />
        <div className="term-grid">
          {quickTerms.map((term, index) => (
            <article key={term.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{term.type}</p><h2>{term.name}</h2><div>{term.summary}</div>
              <small>常見使用情境</small><b>{term.usage}</b>
            </article>
          ))}
        </div>
        <section className="published-quick"><div><p>More tools</p><h2>延伸名詞札記</h2></div><LivePublishedPosts category="quick-look" emptyText="尚未發布延伸名詞文章。" /></section>
      </section>
    </main>
  );
}
