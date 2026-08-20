import type { Metadata } from "next";
import ArticlesPage from "../articles/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文章總覽｜夜行手札",
  description: "依系列整理夜行手札的所有公開文章。",
  alternates: { canonical: "/articles" },
};

export default function NotesPage() {
  return <ArticlesPage />;
}
