"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TechArticle, TechCategory } from "../content/tech";

export function TechExplorer({ categories, articles }: { categories: TechCategory[]; articles: TechArticle[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("zh-Hant");
    return articles.filter((article) => {
      const matchesCategory = category === "all" || article.category === category;
      const haystack = [article.title, article.summary, article.categoryName, ...article.tags].join(" ").toLocaleLowerCase("zh-Hant");
      return matchesCategory && (!keyword || haystack.includes(keyword));
    });
  }, [articles, category, query]);

  return (
    <section className="tech-library" aria-labelledby="tech-library-title">
      <div className="tech-library-head">
        <div><p>Growing library</p><h2 id="tech-library-title">技術札記</h2></div>
        <label className="tech-search"><span>搜尋</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="JavaScript、API、SQL…" /></label>
      </div>
      <div className="tech-filters" aria-label="依分類篩選文章">
        <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>全部</button>
        {categories.slice(0, 3).map((item) => <button className={category === item.slug ? "active" : ""} onClick={() => setCategory(item.slug)} key={item.slug}>{item.name}</button>)}
      </div>
      <div className="tech-article-grid">
        {filtered.map((article, index) => (
          <article className="tech-card" key={article.slug}>
            <span className="tech-card-number">0{index + 1}</span>
            <p>{article.categoryName} · {article.level}</p>
            <h3><Link href={`/tech/${article.slug}`}>{article.title}</Link></h3>
            <span>{article.summary}</span>
            <div>{article.tags.map((tag) => <small key={tag}>#{tag}</small>)}</div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <p className="tech-empty">找不到符合條件的札記，換個關鍵字看看。</p>}
    </section>
  );
}
