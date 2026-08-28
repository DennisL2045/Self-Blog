import { TopBar } from "../../TopBar";
import { LivePublishedPosts } from "../../components/LivePublishedPosts";
import { SeriesNav } from "../../components/SeriesNav";
import { quickTerms } from "../../content/tech";

export const dynamic = "force-dynamic";

export default function QuickLookPage() {
  return (
    <main className="inner-page quick-page">
      <TopBar />
      <section className="inner-content">
        <header className="inner-heading"><p>Quick glossary</p><h1>簡單看看</h1><span>遇到陌生工具時，不急著鑽進所有細節；先知道它解決什麼問題。</span></header>
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
