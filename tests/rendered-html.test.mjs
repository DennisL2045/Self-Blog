import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

async function render(pathname) {
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

async function renderHtml(pathname) {
  const response = await render(pathname);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("首頁呈現四個清楚的內容入口", async () => {
  const html = await renderHtml("/");

  assert.match(html, /<title>夜行手記｜寫給還醒著的人<\/title>/);
  assert.match(html, /href="\/tech"[^>]*>技術成長/);
  assert.match(html, /href="\/tech\/quick-look"/);
  assert.match(html, />簡單看看</);
  assert.match(html, /href="\/experience"/);
  assert.match(html, /href="\/travel"/);
  assert.match(html, /一隻趴在夜晚窗台上的黑色大眼貓/);
});

test("技術成長頁保留分類並撤下公開示範文章", async () => {
  const html = await renderHtml("/tech");

  assert.match(html, />技術成長</);
  assert.match(html, />Web 開發</);
  assert.match(html, />後端與資料</);
  assert.match(html, /第一篇技術文章準備中/);
  assert.doesNotMatch(html, /JavaScript 非同步流程是如何運作的/);
  assert.doesNotMatch(html, /API 冪等性：避免同一筆操作被執行兩次/);
});

test("簡單看看頁整理工具名詞與使用情境", async () => {
  const html = await renderHtml("/tech/quick-look");

  assert.match(html, />簡單看看</);
  assert.match(html, />Git</);
  assert.match(html, />Docker</);
  assert.match(html, />Redis</);
  assert.match(html, /常見使用情境/);
});

test("第一篇 JavaScript 寫作範本包含分類、主題與程式碼示範", async () => {
  const [template, taxonomy, editor, codeBlock] = await Promise.all([
    readFile(new URL("../app/content/editor-templates.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/post-taxonomy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/StudioClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/CodeBlock.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(template, /var、let、const/);
  assert.match(template, /category: "tech"/);
  assert.match(template, /topic: "javascript"/);
  assert.match(template, /\\`\\`\\`js/);
  assert.match(taxonomy, /JavaScript/);
  assert.match(editor, /主題類型/);
  assert.match(editor, /發布後會流向這個公開區塊/);
  assert.match(codeBlock, /navigator\.clipboard\.writeText/);
  assert.match(codeBlock, /複製程式碼/);
});

test("編輯室右側可直接改文並使用獨立滾動區", async () => {
  const [editor, styles] = await Promise.all([
    readFile(new URL("../app/studio/StudioClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(editor, />直接編輯</);
  assert.match(editor, /className="studio-direct-editor"/);
  assert.match(editor, /onChange=\{\(event\) => change\("content", event\.target\.value\)\}/);
  assert.match(editor, /previewScrollRatioRef/);
  assert.match(editor, /previewBodyRef/);
  assert.match(editor, /nextPane\.scrollTop/);
  assert.match(editor, /focus\(\{ preventScroll: true \}\)/);
  assert.match(styles, /\.studio-preview-body[^}]*overflow-y:auto/);
  assert.match(styles, /\.studio-direct-editor[^}]*overflow-y:auto/);
  assert.match(styles, /\.studio-layout \{ height:calc\(100svh - 86px\)/);
  assert.match(styles, /overscroll-behavior:contain/);
});

test("Markdown 表格會顯示為可橫向捲動的資料表", async () => {
  const [markdown, styles] = await Promise.all([
    readFile(new URL("../app/components/SafeMarkdown.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(markdown, /isTableStart\(lines, index\)/);
  assert.match(markdown, /className="markdown-table-wrap"/);
  assert.match(markdown, /<table>/);
  assert.match(markdown, /renderInline\(cell/);
  assert.match(styles, /\.markdown-table-wrap[^}]*overflow-x:auto/);
  assert.match(styles, /\.markdown-table-wrap table[^}]*border-collapse:collapse/);
});

test("Markdown 一般文字會保留作者輸入的單行換行", async () => {
  const markdown = await readFile(new URL("../app/components/SafeMarkdown.tsx", import.meta.url), "utf8");
  assert.match(markdown, /renderInlineLines\(paragraph/);
  assert.match(markdown, /renderInlineLines\(quote/);
  assert.match(markdown, /<br key=/);
  assert.doesNotMatch(markdown, /paragraph\.join\(" "\)/);
});

test("公開文章清單由伺服器輸出並以完整頁面連結開啟文章", async () => {
  const [livePosts, homeNotes, postList, readingPage, studio] = await Promise.all([
    readFile(new URL("../app/components/LivePublishedPosts.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/HomeLatestNotes.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PublishedPostList.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/notes/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/StudioClient.tsx", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(livePosts, /"use client"/);
  assert.match(livePosts, /listPublicPostSummaries\(category, 50\)/);
  assert.doesNotMatch(homeNotes, /"use client"/);
  assert.match(homeNotes, /listPublicPostSummaries\(undefined, 3\)/);
  assert.doesNotMatch(homeNotes, /from "next\/link"/);
  assert.doesNotMatch(postList, /from "next\/link"/);
  assert.match(postList, /<a href=\{`\/notes\/\$\{post\.slug\}`\}>/);
  assert.match(readingPage, /published-breadcrumb/);
  assert.match(readingPage, /readingMinutes\(post\.content\)/);
  assert.match(readingPage, /alternates: \{ canonical: url \}/);
  assert.match(studio, /查看公開文章/);
});

test("搜尋引擎可讀取公開網站規則與網站地圖", async () => {
  const [robotsResponse, sitemapResponse] = await Promise.all([render("/robots.txt"), render("/sitemap.xml")]);
  assert.equal(robotsResponse.status, 200);
  assert.equal(sitemapResponse.status, 200);
  const [robots, sitemap] = await Promise.all([robotsResponse.text(), sitemapResponse.text()]);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Disallow: \/studio/);
  assert.match(robots, /Sitemap: https:\/\/night-notes-cat\.songming1111\.chatgpt\.site\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/night-notes-cat\.songming1111\.chatgpt\.site\/notes<\/loc>/);
  assert.doesNotMatch(sitemap, /\/studio/);
});

test("私人編輯室不出現在公開導覽且寫入路由有伺服器防線", async () => {
  const [topbar, postsRoute, auth] = await Promise.all([
    readFile(new URL("../app/TopBar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/posts/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/studio-auth.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(topbar, /href="\/studio"/);
  assert.match(postsRoute, /getStudioSessionFromRequest\(request\)/);
  assert.match(postsRoute, /isSameOriginMutation\(request\)/);
  assert.match(auth, /allowedEmails\.size >= 1/);
  assert.match(auth, /SameSite=Lax/);
  assert.match(auth, /HttpOnly/);
  assert.match(auth, /headers\(\)/);
  assert.doesNotMatch(auth, /cookies\(\)/);
});

test("Google 登入回呼使用可寫入 Cookie 的重新導向回應", async () => {
  const sessionRoute = await readFile(new URL("../app/api/studio/session/route.ts", import.meta.url), "utf8");

  assert.doesNotMatch(sessionRoute, /Response\.redirect/);
  assert.match(sessionRoute, /new Response\(null, \{ status: 303, headers \}\)/);
  assert.match(sessionRoute, /headers\.set\("Set-Cookie", cookie\)/);
  assert.match(sessionRoute, /"Cache-Control": "no-store"/);
});

test("文章內容與照片採安全輸出及版本保存", async () => {
  const [markdown, mediaRoute, initialMigration, topicMigration] = await Promise.all([
    readFile(new URL("../app/components/SafeMarkdown.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/media/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_nappy_blur.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_condemned_gamma_corps.sql", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(markdown, /dangerouslySetInnerHTML/);
  assert.match(mediaRoute, /8 \* 1024 \* 1024/);
  assert.match(mediaRoute, /output\(\{ format: "image\/webp"/);
  assert.match(initialMigration, /CREATE TABLE `posts`/);
  assert.match(initialMigration, /CREATE TABLE `post_revisions`/);
  assert.match(initialMigration, /CREATE TABLE `media_assets`/);
  assert.match(topicMigration, /ALTER TABLE `posts` ADD `topic`/);
  assert.match(topicMigration, /ALTER TABLE `post_revisions` ADD `topic`/);
});
