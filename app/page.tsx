import Link from "next/link";
import { CatWindow } from "./CatWindow";
import { HomeLatestNotes } from "./components/HomeLatestNotes";

const notes = [
  {
    date: "08.19",
    tag: "JavaScript",
    title: "JavaScript 非同步流程是如何運作的",
    excerpt: "從 Call Stack、Promise 到 Microtask，理解 Event Loop 的執行順序。",
    href: "/tech/javascript-async-flow",
  },
  {
    date: "08.19",
    tag: "後端與資料",
    title: "API 冪等性：避免同一筆操作被執行兩次",
    excerpt: "以建立訂單為例，整理 Idempotency Key、唯一鍵與交易的關係。",
    href: "/tech/api-idempotency",
  },
  {
    date: "08.19",
    tag: "簡單看看",
    title: "Git、Docker、Redis 到底用在哪裡？",
    excerpt: "先用一點時間認識職缺裡常見的工程工具，再決定要往哪裡深入。",
    href: "/tech/quick-look",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="夜行手記首頁">
          夜行手記 <span>after dusk</span>
        </a>
        <nav aria-label="主要選單">
          <Link href="/tech">技術成長</Link>
          <Link href="/experience">個人經歷</Link>
          <Link href="/travel">出遊手札</Link>
          <Link href="/notes">所有札記</Link>
          <Link href="/about">關於</Link>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <CatWindow />
        <div className="hero-copy">
          <p className="eyebrow">A quiet corner on the internet</p>
          <h1 id="hero-title">晚上好，<br />要一起看月亮嗎？</h1>
          <p className="intro">這裡收藏慢慢長出的理解：一段程式、一個做過的選擇、一趟旅程，和深夜才想明白的心情。</p>
          <a className="read-link" href="#notes">往下讀一點 <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className="home-portals" aria-labelledby="portal-title">
        <div className="portal-heading"><p>Four shelves</p><h2 id="portal-title">從哪一頁開始？</h2><span>技術與生活分開整理，需要時仍能在同一個地方找到。</span></div>
        <div className="portal-grid">
          <Link href="/tech"><span>01</span><p>Knowledge</p><h3>技術成長</h3><div>概念、原理、範例與實務取捨。</div></Link>
          <Link href="/tech/quick-look"><span>02</span><p>Quick glossary</p><h3>簡單看看</h3><div>常見工具名詞與大概使用情境。</div></Link>
          <Link href="/experience"><span>03</span><p>Experience</p><h3>個人經歷</h3><div>專案、學習歷程與成長轉折。</div></Link>
          <Link href="/travel"><span>04</span><p>Travel</p><h3>出遊手札</h3><div>地點、照片與旅途裡的小事。</div></Link>
        </div>
      </section>

      <section className="notes" id="notes" aria-labelledby="notes-title">
        <div className="section-heading">
          <p>Latest notes</p>
          <h2 id="notes-title">最近寫下的</h2>
        </div>
        <HomeLatestNotes fallback={notes} />
      </section>

      <section className="about" id="about">
        <p className="about-mark">☾</p>
        <div>
          <p className="eyebrow">About this place</p>
          <h2>寫給還醒著的人</h2>
        </div>
        <p>技術不急著背完，生活也不急著下結論。這裡把複雜概念慢慢拆開，也留下做過的事與走過的地方。希望你來到這裡時，能像貓一樣，找到舒服的位置趴一會兒。</p>
      </section>

      <footer>
        <p>© 2026 夜行手記</p>
        <p>今晚也別太晚睡。</p>
      </footer>
    </main>
  );
}
