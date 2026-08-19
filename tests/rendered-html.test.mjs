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

test("技術成長頁提供分類、搜尋與技術札記", async () => {
  const html = await renderHtml("/tech");

  assert.match(html, />技術成長</);
  assert.match(html, />Web 開發</);
  assert.match(html, />後端與資料</);
  assert.match(html, /placeholder="JavaScript、API、SQL…"/);
  assert.match(html, /JavaScript 非同步流程是如何運作的/);
  assert.match(html, /API 冪等性：避免同一筆操作被執行兩次/);
});

test("簡單看看頁整理工具名詞與使用情境", async () => {
  const html = await renderHtml("/tech/quick-look");

  assert.match(html, />簡單看看</);
  assert.match(html, />Git</);
  assert.match(html, />Docker</);
  assert.match(html, />Redis</);
  assert.match(html, /常見使用情境/);
});

test("技術文章頁呈現章節、程式碼與回到分類的連結", async () => {
  const html = await renderHtml("/tech/javascript-async-flow");

  assert.match(html, /JavaScript 非同步流程是如何運作的/);
  assert.match(html, /Call Stack/);
  assert.match(html, /<pre><code>/);
  assert.match(html, /href="\/tech"[^>]*>← 回到技術成長/);
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
  assert.match(auth, /allowedEmails\.size >= 2/);
  assert.match(auth, /SameSite=Strict/);
  assert.match(auth, /HttpOnly/);
});

test("文章內容與照片採安全輸出及版本保存", async () => {
  const [markdown, mediaRoute, migration] = await Promise.all([
    readFile(new URL("../app/components/SafeMarkdown.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/media/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_nappy_blur.sql", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(markdown, /dangerouslySetInnerHTML/);
  assert.match(mediaRoute, /8 \* 1024 \* 1024/);
  assert.match(mediaRoute, /output\(\{ format: "image\/webp"/);
  assert.match(migration, /CREATE TABLE `posts`/);
  assert.match(migration, /CREATE TABLE `post_revisions`/);
  assert.match(migration, /CREATE TABLE `media_assets`/);
});
