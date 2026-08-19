import { TopBar } from "../TopBar";

export default function ExperiencePage() {
  return (
    <main className="inner-page collection-page"><TopBar /><section className="inner-content">
      <header className="inner-heading"><p>Experience</p><h1>個人經歷</h1><span>留下做過的專案、學習轉折與當時做出選擇的原因，不只列出使用過的工具。</span></header>
      <div className="collection-placeholder"><span>01</span><div><p>這個書架正在整理</p><h2>經歷會由你親自填入</h2><div>之後可以依「工作與專案」、「學習歷程」、「心得回顧」分類。現在先保留乾淨結構，不替你虛構任何內容。</div></div></div>
    </section></main>
  );
}
