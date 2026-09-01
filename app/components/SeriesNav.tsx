import type { PostCategory } from "../lib/posts";

type SeriesKey = "all" | PostCategory;

const series = [
  { key: "all", number: "00", english: "All writing", label: "文章總覽", href: "/articles" },
  { key: "tech", number: "01", english: "Knowledge", label: "技術成長", href: "/tech" },
  { key: "quick-look", number: "02", english: "Quick glossary", label: "簡單看看", href: "/tech/quick-look" },
  { key: "experience", number: "03", english: "Experience", label: "個人經歷", href: "/experience" },
  { key: "travel", number: "04", english: "Travel journal", label: "出遊手札", href: "/travel" },
] as const;

export function SeriesNav({ current }: { current: SeriesKey }) {
  return (
    <nav className="series-nav" aria-label="文章系列">
      <div className="series-nav-track">
        {series.map((item) => (
          <a className={item.key === current ? "active" : ""} href={item.href} aria-current={item.key === current ? "page" : undefined} key={item.key}>
            <span>{item.number}</span><small>{item.english}</small><strong>{item.label}</strong>
          </a>
        ))}
      </div>
    </nav>
  );
}
