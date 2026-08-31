"use client";

import { useRef, useState } from "react";
import { BrandMark } from "./components/BrandMark";

export function TopBar() {
  const catRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function look(clientX: number, clientY: number) {
    const cat = catRef.current;
    if (!cat) return;
    const rect = cat.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (clientX - rect.left - rect.width / 2) / 120));
    const y = Math.max(-1, Math.min(1, (clientY - rect.top - rect.height / 2) / 80));
    cat.style.setProperty("--mini-look-x", `${x * 3}px`);
    cat.style.setProperty("--mini-look-y", `${y * 2}px`);
  }

  return (
    <header className="inner-topbar" onPointerMove={(event) => look(event.clientX, event.clientY)}>
      <a className="inner-brand" href="/" aria-label="夜行手記首頁"><BrandMark compact /><span>夜行手記</span></a>
      <nav
        id="inner-navigation"
        className={`inner-nav ${menuOpen ? "open" : ""}`}
        aria-label="內頁選單"
      >
        <a href="/articles" onClick={() => setMenuOpen(false)}>文章總覽</a>
        <a href="/tech" onClick={() => setMenuOpen(false)}>技術成長</a>
        <a href="/experience" onClick={() => setMenuOpen(false)}>個人經歷</a>
        <a href="/travel" onClick={() => setMenuOpen(false)}>出遊手札</a>
        <a href="/about" onClick={() => setMenuOpen(false)}>關於</a>
        <a href="/about#contact" onClick={() => setMenuOpen(false)}>聯絡我</a>
      </nav>
      <div className="topbar-cat" ref={catRef} aria-label="趴在導覽列上的黑色大眼貓" role="img">
        <span className="topbar-tail">
          <i className="topbar-tail-tip" />
        </span>
        <span className="topbar-cat-body" />
        <span className="topbar-cat-head">
          <i className="topbar-ear left" /><i className="topbar-ear right" />
          <i className="topbar-eye left"><b /></i><i className="topbar-eye right"><b /></i>
        </span>
        <span className="topbar-paw left" /><span className="topbar-paw right" />
      </div>
      <button
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        type="button"
        aria-label={menuOpen ? "關閉選單" : "開啟選單"}
        aria-expanded={menuOpen}
        aria-controls="inner-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
