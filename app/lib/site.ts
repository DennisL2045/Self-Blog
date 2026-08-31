export const siteUrl = "https://dennisnightnotes.com";
export const siteName = "夜行手記";
export const siteEnglishName = "Dennis Night Notes";
export const siteTagline = "Dennis 的程式學習與生活筆記";
export const siteDescription = "Dennis 的程式學習、系統開發與生活紀錄，整理 JavaScript、前後端實作與技術札記，也收錄旅行、跑步與個人經歷。";
export const authorName = "Dennis";

export function absoluteSiteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}
