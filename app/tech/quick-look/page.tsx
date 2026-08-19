import { TopBar } from "../../TopBar";
import { quickTerms } from "../../content/tech";

export default function QuickLookPage() {
  return (
    <main className="inner-page quick-page">
      <TopBar />
      <section className="inner-content">
        <header className="inner-heading"><p>Quick glossary</p><h1>簡單看看</h1><span>遇到陌生工具時，不急著鑽進所有細節；先知道它解決什麼問題，以及通常在哪裡出現。</span></header>
        <div className="quick-intro"><strong>怎麼使用這一區？</strong><p>這裡是技術地圖的入口，不取代完整文件。名詞熟悉後，再前往對應的技術札記理解原理、限制與實作方式。</p></div>
        <div className="term-grid">
          {quickTerms.map((term, index) => (
            <article key={term.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{term.type}</p><h2>{term.name}</h2><div>{term.summary}</div>
              <small>常見使用情境</small><b>{term.usage}</b>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
