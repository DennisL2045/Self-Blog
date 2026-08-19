"use client";

import Link from "next/link";
import { useRef } from "react";

export function TopBar() {
  const catRef = useRef<HTMLDivElement>(null);

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
      <Link className="inner-brand" href="/">夜行手札</Link>
      <nav className="inner-nav" aria-label="內頁選單">
        <Link href="/tech">技術成長</Link>
        <Link href="/experience">個人經歷</Link>
        <Link href="/travel">出遊手札</Link>
        <Link href="/notes">所有札記</Link>
        <Link href="/about">關於</Link>
        <Link href="/about#contact">聯絡我</Link>
      </nav>
      <div className="topbar-cat" ref={catRef} aria-label="趴在導覽列上的黑色大眼貓" role="img">
        <span className="topbar-tail" />
        <span className="topbar-cat-body" />
        <span className="topbar-cat-head">
          <i className="topbar-ear left" /><i className="topbar-ear right" />
          <i className="topbar-eye left"><b /></i><i className="topbar-eye right"><b /></i>
        </span>
        <span className="topbar-paw left" /><span className="topbar-paw right" />
      </div>
    </header>
  );
}
