import type { Metadata } from "next";
import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";
import { SeriesNav } from "../components/SeriesNav";
import { listPublicPostSummaries } from "../lib/public-posts";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const posts = await listPublicPostSummaries("experience", 1);
  return {
    title: "個人經歷｜專案、學習歷程與成長記錄｜夜行手記",
    description: "Dennis 的專案實作、學習轉折與成長記錄，保留當時的問題、選擇與實際使用情境。",
    alternates: { canonical: "/experience" },
    robots: posts.length ? undefined : { index: false, follow: true },
  };
}

export default function ExperiencePage() {
  return (
    <main className="inner-page collection-page"><TopBar /><section className="inner-content">
      <header className="inner-heading"><p>Experience</p><h1>個人經歷</h1><span>留下做過的專案、學習轉折與當時做出選擇的原因，不只列出使用過的工具。</span></header>
      <SeriesNav current="experience" />
      <LivePublishedPosts category="experience" emptyText="這個書架目前還沒有文章。" />
    </section></main>
  );
}
