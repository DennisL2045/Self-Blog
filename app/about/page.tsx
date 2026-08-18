import { TopBar } from "../TopBar";

export default function AboutPage() {
  return (
    <main className="inner-page">
      <TopBar />
      <section className="inner-content about-page">
        <header className="inner-heading"><p>About</p><h1>關於這裡</h1><span>寫給夜裡還醒著，也願意慢下來的人。</span></header>
        <div className="about-story">
          <span className="story-moon">☾</span>
          <div>
            <p>夜行手札不追趕更新頻率，也不急著把每件事說清楚。</p>
            <p>這裡收著散步時遇見的光、讀到一半的書、沒能寄出的信，還有深夜才慢慢浮上來的心情。希望你來到這裡時，可以像趴在窗台上的貓一樣，找到一個舒服的位置停留片刻。</p>
            <a href="mailto:hello@example.com">寫一封信給我 <span>↗</span></a>
          </div>
        </div>
      </section>
    </main>
  );
}
