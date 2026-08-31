import type { Metadata } from "next";
import ArticlesPage from "../articles/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文章總覽｜夜行手記",
  description: "瀏覽夜行手記的所有公開文章，依技術成長、工具名詞、個人經歷與出遊手札分門整理。",
  alternates: { canonical: "/articles" },
};

export default function NotesPage() {
  return <ArticlesPage />;
}
