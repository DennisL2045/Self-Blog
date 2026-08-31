import type { PostCategory, PostRecord, PublishedPostSummaryRecord } from "./posts";

function isWeakExcerpt(excerpt: string) {
  const normalized = excerpt.replace(/\s+/g, "").replace(/[。！？!?，,、]/g, "");
  if (normalized.length < 14) return true;
  return /^(.{2,12})\1+$/.test(normalized);
}

type ExcerptSource = Pick<PublishedPostSummaryRecord, "title" | "excerpt" | "category"> & {
  contentPreview?: string;
  content?: string;
};

export function publicPostExcerpt(post: ExcerptSource) {
  if (!isWeakExcerpt(post.excerpt)) return post.excerpt.trim();
  return contentBasedDescription(post.contentPreview ?? post.content ?? "", post.category, post.title);
}

export function postSeoDescription(post: Pick<PostRecord, "title" | "excerpt" | "content" | "category">) {
  if (!isWeakExcerpt(post.excerpt)) return limitDescription(post.excerpt);
  return contentBasedDescription(post.content, post.category, post.title, 155);
}

function contentBasedDescription(content: string, category: PostCategory, title: string, max = 140) {
  const definition = definitionSection(content);
  const source = definition || content;
  const paragraphs = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^[-*>]+\s*/gm, "")
      .replace(/[`*_~|]/g, " ")
      .replace(/\s+/g, " ")
      .trim())
    .filter((paragraph) => paragraph.length >= 12 && paragraph !== "---");
  const count = category === "travel" || category === "experience" ? 2 : definition ? 4 : 3;
  const description = paragraphs.slice(0, count).join(" ");
  if (description) return limitDescription(description, max);
  return categoryFallback(category, title);
}

function definitionSection(content: string) {
  const match = /^##\s*什麼是[^\n]*$/m.exec(content);
  if (!match) return "";
  const section = content.slice(match.index + match[0].length);
  return section.split(/^##\s+/m)[0] ?? section;
}

function categoryFallback(category: PostCategory, title: string) {
  if (category === "travel") return `記錄「${title}」沿途的風景、活動體驗與當下感受。`;
  if (category === "experience") return `回顧「${title}」的實際經歷、當時選擇與一路累積的心得。`;
  if (category === "quick-look") return `從實際使用情境認識「${title}」，先理解它解決的問題與常見出現位置。`;
  return `從概念、範例與執行結果理解「${title}」，整理容易混淆的地方與實際使用方式。`;
}

function limitDescription(value: string, max = 155) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/[，、；：\s]+$/g, "")}…`;
}
