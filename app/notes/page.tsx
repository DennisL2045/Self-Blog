import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";

export const dynamic = "force-dynamic";

export default function NotesPage() {
  return (
    <main className="inner-page">
      <TopBar />
      <section className="inner-content notes-index-page">
        <header className="inner-heading"><p>Published notes</p><h1>所有札記</h1><span>只有在夜行編輯室按下發布的內容，才會出現在這裡。</span></header>
        <LivePublishedPosts emptyText="第一篇文章還在慢慢成形。" />
      </section>
    </main>
  );
}
