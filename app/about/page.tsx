import type { Metadata } from "next";
import { TopBar } from "../TopBar";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "關於 Dennis 與夜行手記",
  description: "認識 Dennis 與夜行手記：記錄程式學習、系統開發、個人經歷與旅途觀察的個人網站。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="inner-page">
      <TopBar />
      <section className="inner-content about-page">
        <header className="inner-heading"><p>About</p><h1>關於這裡</h1><span>整理技術理解，也收藏做過的事與走過的地方。</span></header>
        <div className="about-story">
          <span className="story-moon">☾</span>
          <div>
            <p>夜行手記不追趕更新頻率，也不把理解壓縮成標準答案。</p>
            <p>這裡會慢慢收進程式概念、專案經驗與旅途記錄。希望每篇內容都保留脈絡與實際使用情境，讓日後回來閱讀時，仍能接續當時的思考。</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
