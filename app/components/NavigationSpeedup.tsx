"use client";

import { useEffect } from "react";

function internalPageLink(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (!link || link.target || link.download || link.origin !== window.location.origin) return null;
  if (link.pathname.startsWith("/studio") || link.pathname.startsWith("/api/") || link.pathname.startsWith("/media/")) return null;
  if (link.pathname === window.location.pathname && link.search === window.location.search) return null;
  return link;
}

export function NavigationSpeedup() {
  useEffect(() => {
    const prefetched = new Set<string>();

    function warmPage(event: Event) {
      const link = internalPageLink(event.target);
      if (!link || prefetched.has(link.href)) return;
      prefetched.add(link.href);
      void fetch(link.href, {
        headers: { Accept: "text/html" },
        credentials: "same-origin",
      }).catch(() => prefetched.delete(link.href));
    }

    function showProgress(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (internalPageLink(event.target)) document.documentElement.classList.add("route-changing");
    }

    function clearProgress() {
      document.documentElement.classList.remove("route-changing");
    }

    document.addEventListener("pointerover", warmPage, { passive: true });
    document.addEventListener("focusin", warmPage);
    document.addEventListener("touchstart", warmPage, { passive: true });
    document.addEventListener("click", showProgress);
    window.addEventListener("pageshow", clearProgress);

    return () => {
      document.removeEventListener("pointerover", warmPage);
      document.removeEventListener("focusin", warmPage);
      document.removeEventListener("touchstart", warmPage);
      document.removeEventListener("click", showProgress);
      window.removeEventListener("pageshow", clearProgress);
    };
  }, []);

  return <span className="route-progress" aria-hidden="true" />;
}
