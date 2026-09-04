import type { Metadata } from "next";
import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";
import { SeriesNav } from "../components/SeriesNav";
import { listPublicPostSummaries } from "../lib/public-posts";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const posts = await listPublicPostSummaries("travel", 1);
  return {
    title: "出遊手札｜馬拉松、旅行與生活記錄｜夜行手記",
    description: "Dennis 的馬拉松、旅行與生活記錄，以地點、日期、照片和旅途中的細小感受整理每段路程。",
    alternates: { canonical: "/travel" },
    robots: posts.length ? undefined : { index: false, follow: true },
  };
}

export default function TravelPage() {
  return (
    <main className="inner-page collection-page"><TopBar /><section className="inner-content">
      <header className="inner-heading"><p>Travel journal</p><h1>出遊手札</h1><span>快樂出遊的點滴</span></header>
      <SeriesNav current="travel" />
      <LivePublishedPosts category="travel" emptyText="下一段旅程還沒寫下。" />
    </section></main>
  );
}
