import type { Metadata } from "next";
import { TopBar } from "../TopBar";
import { DoodleMoon } from "../components/BrandMark";
import { ContactForm } from "./ContactForm";
import { absoluteSiteUrl, authorName, siteDescription, siteName } from "../lib/site";

export const metadata: Metadata = {
  title: "關於 Dennis 與夜行手記",
  description: "認識 Dennis 與夜行手記：記錄程式學習、系統開發、個人經歷與旅途觀察的個人網站。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${absoluteSiteUrl("/about")}#profile`,
    url: absoluteSiteUrl("/about"),
    name: `關於 ${authorName} 與${siteName}`,
    description: siteDescription,
    inLanguage: "zh-Hant",
    mainEntity: {
      "@type": "Person",
      "@id": `${absoluteSiteUrl("/about")}#dennis`,
      name: authorName,
      url: absoluteSiteUrl("/about"),
      description: "夜行手記作者，記錄 JavaScript、Web 與系統開發，也收藏馬拉松、旅行與生活經歷。",
    },
  };
  return (
    <main className="inner-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd).replace(/</g, "\\u003c") }} />
      <TopBar />
      <section className="inner-content about-page">
        <header className="inner-heading"><p>About</p><h1>關於這裡</h1><span>整理技術理解，也收藏做過的事與走過的地方。</span></header>
        <div className="about-story">
          <span className="story-moon"><DoodleMoon /></span>
          <div>
            <p>夜行手記不追趕更新頻率，也不把理解壓縮成標準答案。</p>
            <p>這裡會慢慢收進程式概念、專案經驗與旅途記錄。希望每篇內容都保留脈絡與實際使用情境，讓日後回來閱讀時，仍能接續當時的思考。</p>
            <section className="author-note" aria-labelledby="author-note-title">
              <span className="author-monogram" aria-hidden="true"><DoodleMoon /></span>
              <div><p>Site author</p><h2 id="author-note-title">我是 Dennis</h2><div>平常把遇到的 JavaScript、Web 與系統開發問題慢慢拆開，整理成自己能再次讀懂的筆記。這裡也會留下專案過程、馬拉松與旅行中值得記住的事情。</div></div>
            </section>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
