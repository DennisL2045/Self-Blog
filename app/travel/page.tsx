import type { Metadata } from "next";
import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";
import { SeriesNav } from "../components/SeriesNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "出遊手札｜旅行、跑步與生活記錄｜夜行手記",
  description: "Dennis 的旅行、跑步與生活記錄，以地點、日期、照片和旅途中的細小感受整理每段路程。",
  alternates: { canonical: "/travel" },
};

export default function TravelPage() {
  return (
    <main className="inner-page collection-page"><TopBar /><section className="inner-content">
      <header className="inner-heading"><p>Travel journal</p><h1>出遊手札</h1><span>以地點、日期和照片整理旅程，也保留當時的聲音、天氣與細小感受。</span></header>
      <SeriesNav current="travel" />
      <LivePublishedPosts category="travel" emptyText="下一段旅程還沒寫下。" />
    </section></main>
  );
}
