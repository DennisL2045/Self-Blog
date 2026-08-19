import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";

export const dynamic = "force-dynamic";

export default function TravelPage() {
  return (
    <main className="inner-page collection-page"><TopBar /><section className="inner-content">
      <header className="inner-heading"><p>Travel journal</p><h1>出遊手札</h1><span>以地點、日期和照片整理旅程，也保留當時的聲音、天氣與細小感受。</span></header>
      <LivePublishedPosts category="travel" emptyText="下一段旅程還沒寫下。" />
    </section></main>
  );
}
