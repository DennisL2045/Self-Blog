"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";

const links = [
  { href: "/articles", label: "文章總覽" },
  { href: "/tech", label: "技術成長" },
  { href: "/experience", label: "個人經歷" },
  { href: "/travel", label: "出遊手札" },
  { href: "/about", label: "關於" },
];

export function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="夜行手記首頁">
        <BrandMark />
        <span className="wordmark-text">夜行手記 <small>Dennis Night Notes</small></span>
      </a>
      <nav id="site-navigation" className={`site-nav ${menuOpen ? "open" : ""}`} aria-label="主要選單">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
        ))}
      </nav>
      <button
        className={`site-menu-toggle ${menuOpen ? "open" : ""}`}
        type="button"
        aria-label={menuOpen ? "關閉選單" : "開啟選單"}
        aria-expanded={menuOpen}
        aria-controls="site-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
