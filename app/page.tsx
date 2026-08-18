import { CatWindow } from "./CatWindow";

const notes = [
  {
    date: "08.16",
    tag: "生活碎片",
    title: "在城市熄燈之後，替自己留一盞小燈",
    excerpt: "有些日子不需要結論，只需要慢慢走回家，聽見自己的腳步。",
  },
  {
    date: "08.09",
    tag: "散步筆記",
    title: "雨停以前，我們都在屋簷下",
    excerpt: "便利商店的熱咖啡、潮濕的柏油路，還有一場沒有說完的雨。",
  },
  {
    date: "07.28",
    tag: "正在閱讀",
    title: "把書翻到有月光的那一頁",
    excerpt: "關於近日讀過的三本小書，以及那些被摺起來的句子。",
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
          <a href="/articles">文章</a>
          <a href="/about">關於</a>
          <a href="mailto:hello@example.com">寫信給我</a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <CatWindow />
        <div className="hero-copy">
          <p className="eyebrow">A quiet corner on the internet</p>
          <h1 id="hero-title">晚上好，<br />要一起看月亮嗎？</h1>
          <p className="intro">這裡收藏生活裡容易錯過的小事：一本讀了一半的書、一段散步，和深夜才想明白的心情。</p>
          <a className="read-link" href="#notes">往下讀一點 <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className="notes" id="notes" aria-labelledby="notes-title">
        <div className="section-heading">
          <p>Latest notes</p>
          <h2 id="notes-title">最近寫下的</h2>
        </div>
        <div className="note-list">
          {notes.map((note, index) => (
            <article className="note" key={note.title}>
              <span className="note-index">0{index + 1}</span>
              <div>
                <p className="note-meta"><time>{note.date}</time> · {note.tag}</p>
                <h3><a href="/articles">{note.title}</a></h3>
                <p>{note.excerpt}</p>
              </div>
              <span className="note-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="about" id="about">
        <p className="about-mark">☾</p>
        <div>
          <p className="eyebrow">About this place</p>
          <h2>寫給還醒著的人</h2>
        </div>
        <p>不追趕更新頻率，也不急著把每件事說清楚。偶爾寫字，偶爾發呆。希望你來到這裡時，能像貓一樣，找到舒服的位置趴一會兒。</p>
      </section>

      <footer>
        <p>© 2026 夜行手記</p>
        <p>今晚也別太晚睡。</p>
      </footer>
    </main>
  );
}
