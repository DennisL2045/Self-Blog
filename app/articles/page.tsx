import type { Metadata } from "next";
import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";
import { SeriesNav } from "../components/SeriesNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文章總覽｜夜行手記",
  description: "瀏覽夜行手記的所有公開文章，依技術成長、工具名詞、個人經歷與出遊手札分門整理。",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  return (
    <main className="inner-page articles-page">
      <TopBar />
      <section className="inner-content">
        <header className="inner-heading"><p>All published writing</p><h1>文章總覽</h1><span>期許會有一篇你想要看的。</span></header>
        <SeriesNav current="all" />
        <section className="article-hub-list" aria-labelledby="all-articles-title">
          <div className="article-hub-heading"><p>Latest archive</p><h2 id="all-articles-title">全部文章</h2><span>按照發布時間排列，從最近寫下的內容開始閱讀。</span></div>
          <LivePublishedPosts emptyText="第一篇文章準備中。" />
        </section>
      </section>
    </main>
  );
}
