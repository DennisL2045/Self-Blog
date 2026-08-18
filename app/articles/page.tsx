import { TopBar } from "../TopBar";

const entries = [
  ["08.16", "生活碎片", "在城市熄燈之後，替自己留一盞小燈", "有些日子不需要結論，只需要慢慢走回家，聽見自己的腳步。"],
  ["08.09", "散步筆記", "雨停以前，我們都在屋簷下", "便利商店的熱咖啡、潮濕的柏油路，還有一場沒有說完的雨。"],
  ["07.28", "正在閱讀", "把書翻到有月光的那一頁", "關於近日讀過的三本小書，以及那些被摺起來的句子。"],
  ["07.13", "夜晚來信", "凌晨兩點的廚房還亮著", "一碗簡單的麵，和失眠時突然想起的人。"],
];

export default function ArticlesPage() {
  return (
    <main className="inner-page">
      <TopBar />
      <section className="inner-content">
        <header className="inner-heading"><p>All notes</p><h1>文章</h1><span>把生活裡微小的聲音，慢慢記下來。</span></header>
        <div className="article-index">
          {entries.map(([date, tag, title, excerpt], index) => (
            <article key={title}>
              <span className="article-number">0{index + 1}</span>
              <div><p>{date} · {tag}</p><h2>{title}</h2><span>{excerpt}</span></div>
              <a href={`#note-${index + 1}`} aria-label={`閱讀${title}`}>↗</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
