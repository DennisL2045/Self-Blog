import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";

export default function ArticlesPage() {
  return (
    <main className="inner-page">
      <TopBar />
      <section className="inner-content">
        <header className="inner-heading"><p>All notes</p><h1>文章</h1><span>只有正式發布的文章才會出現在這裡。</span></header>
        <LivePublishedPosts emptyText="第一篇文章準備中。" />
      </section>
    </main>
  );
}
