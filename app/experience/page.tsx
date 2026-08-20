import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";
import { SeriesNav } from "../components/SeriesNav";

export const dynamic = "force-dynamic";

export default function ExperiencePage() {
  return (
    <main className="inner-page collection-page"><TopBar /><section className="inner-content">
      <header className="inner-heading"><p>Experience</p><h1>個人經歷</h1><span>留下做過的專案、學習轉折與當時做出選擇的原因，不只列出使用過的工具。</span></header>
      <SeriesNav current="experience" />
      <LivePublishedPosts category="experience" emptyText="這個書架目前還沒有文章。" />
    </section></main>
  );
}
