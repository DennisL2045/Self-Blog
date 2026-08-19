import { TopBar } from "../TopBar";
import { LivePublishedPosts } from "../components/LivePublishedPosts";

export default function TravelPage() {
  return (
    <main className="inner-page collection-page"><TopBar /><section className="inner-content">
      <header className="inner-heading"><p>Travel journal</p><h1>出遊手札</h1><span>以地點、日期和照片整理旅程，也保留當時的聲音、天氣與細小感受。</span></header>
      <LivePublishedPosts category="travel" fallback={<div className="collection-placeholder travel-placeholder"><span>☾</span><div><p>下一段路還沒寫下</p><h2>照片與故事將從這裡開始</h2><div>未來可依地點、年份與旅程建立相簿式文章；發文工具會先移除照片中的 GPS 與相機資訊再發布。</div></div></div>} />
    </section></main>
  );
}
