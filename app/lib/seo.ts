import type { PostRecord, PublishedPostSummaryRecord } from "./posts";

function isWeakExcerpt(excerpt: string) {
  const normalized = excerpt.replace(/\s+/g, "").replace(/[。！？!?，,、]/g, "");
  if (normalized.length < 28) return true;
  return /^(.{2,12})\1+$/.test(normalized);
}

export function publicPostExcerpt(post: Pick<PublishedPostSummaryRecord, "title" | "excerpt">) {
  if (!isWeakExcerpt(post.excerpt)) return post.excerpt.trim();
  return `整理「${post.title}」的核心概念、程式碼範例與常見使用情境，留下可以回頭查閱的理解。`;
}

export function postSeoDescription(post: Pick<PostRecord, "title" | "excerpt" | "content">) {
  if (!isWeakExcerpt(post.excerpt)) return limitDescription(post.excerpt);
  const content = post.content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*>]+\s*/gm, "")
    .replace(/[`*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return limitDescription(content || publicPostExcerpt(post));
}

function limitDescription(value: string, max = 155) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/[，、；：\s]+$/g, "")}…`;
}
