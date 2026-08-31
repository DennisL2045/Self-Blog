import type { Metadata } from "next";
import { TopBar } from "./TopBar";
import { siteName } from "./lib/site";

export const metadata: Metadata = {
  title: `找不到這一頁｜${siteName}`,
  description: "這個網址沒有對應的公開內容，可以回到文章總覽或技術成長繼續閱讀。",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <main className="inner-page">
      <TopBar />
      <section className="article-missing">
        <p>404 · This page is not on the shelf</p>
        <h1>這一頁暫時不在書架上</h1>
        <div><a href="/articles">查看文章總覽</a><a href="/tech">前往技術成長</a><a href="/">返回首頁</a></div>
      </section>
    </main>
  );
}
