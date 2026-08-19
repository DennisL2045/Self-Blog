import { TopBar } from "../TopBar";

export default function AboutPage() {
  return (
    <main className="inner-page">
      <TopBar />
      <section className="inner-content about-page">
        <header className="inner-heading"><p>About</p><h1>關於這裡</h1><span>整理技術理解，也收藏做過的事與走過的地方。</span></header>
        <div className="about-story">
          <span className="story-moon">☾</span>
          <div>
            <p>夜行手札不追趕更新頻率，也不把理解壓縮成標準答案。</p>
            <p>這裡會慢慢收進程式概念、專案經驗與旅途記錄。希望每篇內容都保留脈絡與實際使用情境，讓日後回來閱讀時，仍能接續當時的思考。</p>
            <p id="contact"><strong>聯絡我</strong><br />公開聯絡信箱準備好後會放在這裡，不會使用範本或私人帳號代替。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
