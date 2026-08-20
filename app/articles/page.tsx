import type { Metadata } from "next";
import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";
import { SeriesNav } from "../components/SeriesNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文章總覽｜夜行手札",
  description: "依技術成長、簡單看看、個人經歷與出遊手札整理所有公開文章。",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  return (
    <main className="inner-page articles-page">
      <TopBar />
      <section className="inner-content">
        <header className="inner-heading"><p>All published writing</p><h1>文章總覽</h1><span>從一個總入口前往各個系列；只有正式發布的文章才會出現在公開書架。</span></header>
        <SeriesNav current="all" />
        <section className="article-hub-list" aria-labelledby="all-articles-title">
          <div><p>Latest archive</p><h2 id="all-articles-title">全部文章</h2><span>按照發布時間排列，從最近寫下的內容開始閱讀。</span></div>
          <LivePublishedPosts emptyText="第一篇文章準備中。" />
        </section>
      </section>
    </main>
  );
}
