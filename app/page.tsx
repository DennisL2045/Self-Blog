import { CatWindow } from "./CatWindow";
import { DoodleMoon } from "./components/BrandMark";
import { HomeHeader } from "./components/HomeHeader";
import { HomeLatestNotes } from "./components/HomeLatestNotes";
import { absoluteSiteUrl, authorName, siteDescription, siteEnglishName, siteName } from "./lib/site";

export const dynamic = "force-dynamic";

export default function Home() {
  const identityJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absoluteSiteUrl()}#website`,
        url: absoluteSiteUrl(),
        name: siteName,
        alternateName: [siteEnglishName, "dennisnightnotes.com"],
        description: siteDescription,
        inLanguage: "zh-Hant",
      },
      {
        "@type": "Person",
        "@id": `${absoluteSiteUrl("/about")}#dennis`,
        name: authorName,
        url: absoluteSiteUrl("/about"),
      },
    ],
  };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(identityJsonLd).replace(/</g, "\\u003c") }} />
      <HomeHeader />

      <section className="hero" id="top" aria-labelledby="hero-title">
        <CatWindow />
        <div className="hero-copy">
          <p className="eyebrow">A quiet corner on the internet</p>
          <h1 id="hero-title">晚上好，<br />要一起看月亮嗎？</h1>
          <p className="brand-intro">Dennis 的程式學習、系統開發與生活紀錄</p>
          <p className="intro">這裡收藏一些我的理解：一點程式、一趟旅程、一段經歷。</p>
          <a className="read-link" href="#notes">往下讀一點 <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className="home-portals" aria-labelledby="portal-title">
        <div className="portal-heading"><p>Four shelves</p><h2 id="portal-title">從哪一頁開始？</h2><span>技術與生活分開整理，需要時仍能在同一個地方找到。</span></div>
        <div className="portal-grid">
          <a href="/tech"><span>01</span><p>Knowledge</p><h3>技術成長</h3><div>概念、原理、範例與實務取捨。</div></a>
          <a href="/tech/quick-look"><span>02</span><p>Quick glossary</p><h3>簡單看看</h3><div>常見工具名詞與大概使用情境。</div></a>
          <a href="/experience"><span>03</span><p>Experience</p><h3>個人經歷</h3><div>專案、學習歷程與成長轉折。</div></a>
          <a href="/travel"><span>04</span><p>Travel</p><h3>出遊手札</h3><div>旅途中的一些小事。</div></a>
        </div>
      </section>

      <section className="notes" id="notes" aria-labelledby="notes-title">
        <div className="section-heading">
          <p>Latest notes</p>
          <h2 id="notes-title">最近寫下的</h2>
        </div>
        <HomeLatestNotes />
      </section>

      <section className="about" id="about">
        <p className="about-mark"><DoodleMoon /></p>
        <div>
          <p className="eyebrow">About this place</p>
          <h2>寫給還醒著的人</h2>
        </div>
        <p>技術不急著解讀完，生活還得慢慢品嘗。把複雜與概念慢慢拆解，留下做過的事與走過的地方。</p>
      </section>

      <footer>
        <p>© 2026 夜行手記 · Dennis Night Notes</p>
        <DoodleMoon className="footer-moon" />
        <p>今晚也別太晚睡。</p>
      </footer>
    </main>
  );
}
