"use client";

import { useState } from "react";
import type { PublishedPostSummary } from "../lib/public-posts";
import { PublishedPostList } from "./PublishedPostList";

export function PaginatedPostList({
  posts,
  emptyText,
  pageSize = 5,
}: {
  posts: PublishedPostSummary[];
  emptyText?: string;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visiblePosts = posts.slice(startIndex, startIndex + pageSize);

  function changePage(nextPage: number) {
    setPage(Math.max(1, Math.min(totalPages, nextPage)));
  }

  return (
    <div className="paginated-posts">
      <div className="paginated-post-page" key={currentPage}>
        <PublishedPostList posts={visiblePosts} emptyText={emptyText} startIndex={startIndex} />
      </div>
      {posts.length > 0 ? (
        <nav className="article-pagination" aria-label="文章分頁">
          <button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>← 上一頁</button>
          <div>
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  className={pageNumber === currentPage ? "active" : ""}
                  type="button"
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                  aria-label={`第 ${pageNumber} 頁`}
                  onClick={() => changePage(pageNumber)}
                  key={pageNumber}
                >
                  {String(pageNumber).padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>下一頁 →</button>
          <p className="pagination-status" aria-live="polite">第 {currentPage} 頁，共 {totalPages} 頁</p>
        </nav>
      ) : null}
    </div>
  );
}
