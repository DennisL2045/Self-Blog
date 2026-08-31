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

  assert.match(html, /<title>夜行手記｜Dennis 的程式學習、系統開發與跑旅筆記<\/title>/);
  assert.match(html, /Dennis Night Notes/);
  assert.match(html, /Dennis 的程式學習、系統開發與生活紀錄/);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /"alternateName":\["Dennis Night Notes","dennisnightnotes.com"\]/);
  assert.match(html, /href="\/tech"[^>]*>技術成長/);
  assert.match(html, /href="\/articles"[^>]*>文章總覽/);
  assert.match(html, /href="\/tech\/quick-look"/);
  assert.match(html, />簡單看看</);
  assert.match(html, /href="\/experience"/);
  assert.match(html, /href="\/travel"/);
  assert.match(html, /一隻趴在夜晚窗台上的黑色大眼貓/);
});

test("品牌圖示採深夜藍 N 並保留完整網站名稱", async () => {
  const [home, topbar, layout, manifest, icon] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/TopBar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/icon-512x512.png", import.meta.url)),
  ]);
  assert.match(home, /<BrandMark \/><span className="wordmark-text">夜行手記/);
  assert.match(topbar, /<BrandMark compact \/><span>夜行手記<\/span>/);
  assert.match(layout, /favicon-48x48\.png/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(manifest, /theme_color: "#101525"/);
  assert.deepEqual([...icon.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("技術成長頁保留分類並撤下公開示範文章", async () => {
  const html = await renderHtml("/tech");

  assert.match(html, />技術成長</);
  assert.match(html, />Web 開發</);
  assert.match(html, />後端與資料</);
  assert.match(html, /href="\/tech\/web-development"/);
  assert.match(html, /href="\/tech\/backend-data"/);
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
  assert.match(html, /先知道它解決什麼問題。/);
  assert.doesNotMatch(html, /以及通常在哪裡出現|怎麼使用這一區/);
});

test("聯絡頁只顯示表單，收件地址留在伺服器密鑰", async () => {
  const [html, route, runtime, envExample] = await Promise.all([
    renderHtml("/about"),
    readFile(new URL("../app/api/contact/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/runtime.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(html, />聯絡我</);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="message"/);
  assert.doesNotMatch(html, /mailto:|@gmail\.com/);
  assert.match(route, /runtime\.CONTACT_TO_EMAIL/);
  assert.match(route, /runtime\.RESEND_API_KEY/);
  assert.match(route, /contact_rate_limits/);
  assert.match(route, /origin !== requestUrl\.origin/);
  assert.match(runtime, /CONTACT_TO_EMAIL\?: string/);
  assert.match(envExample, /CONTACT_TO_EMAIL=\r?\n/);
  assert.doesNotMatch(envExample, /@gmail\.com/);
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
  assert.match(template, /techCollection: "web-development"/);
  assert.match(template, /topic: "javascript"/);
  assert.match(template, /\\`\\`\\`js/);
  assert.match(taxonomy, /JavaScript/);
  assert.match(editor, /主題類型/);
  assert.match(editor, /技術子分類/);
  assert.match(editor, /發布後會流向這個公開區塊/);
  assert.match(codeBlock, /navigator\.clipboard\.writeText/);
  assert.match(codeBlock, /複製程式碼/);
});

test("編輯室可以新增並重複使用自訂主題", async () => {
  const [editor, taxonomy, posts] = await Promise.all([
    readFile(new URL("../app/studio/StudioClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/post-taxonomy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/posts.ts", import.meta.url), "utf8"),
  ]);
  assert.match(editor, /＋ 新增自訂主題/);
  assert.match(editor, /studioTopicsForCategory\(draft\.category, posts\)/);
  assert.match(editor, /maxLength=\{40\}/);
  assert.match(editor, /請先輸入自訂主題名稱/);
  assert.match(taxonomy, /export type PostTopic = string/);
  assert.match(taxonomy, /return topic \|\| "其他"/);
  assert.match(posts, /function topicValue/);
  assert.doesNotMatch(posts, /postTopics\.includes\(payload\.topic/);
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
  assert.match(livePosts, /listPublicPostSummaries\(category, 50, techCollection\)/);
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

test("技術分類卡片會開啟自己的文章列表", async () => {
  const [webHtml, backendHtml, techPage, collectionPage, posts, editor, styles] = await Promise.all([
    renderHtml("/tech/web-development"),
    renderHtml("/tech/backend-data"),
    readFile(new URL("../app/tech/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tech/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/posts.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/StudioClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(webHtml, />Web 開發</);
  assert.match(webHtml, /Web 開發(?:<!-- -->)?文章/);
  assert.match(backendHtml, />後端與資料</);
  assert.match(techPage, /href=\{`\/tech\/\$\{category\.slug\}`\}/);
  assert.match(techPage, /articleCounts\.get\(category\.slug\)/);
  assert.match(techPage, /PaginatedPostList posts=\{posts\}/);
  assert.match(collectionPage, /className="collection-hero"/);
  assert.match(collectionPage, /className="collection-article-heading"/);
  assert.match(posts, /AND tech_collection = \?/);
  assert.match(posts, /defaultTechCollectionForTopic/);
  assert.match(editor, /技術成長.*Web 開發.*JavaScript/);
  assert.match(styles, /\.collection-hero > div[^}]*display:flex[^}]*justify-content:space-between/);
  assert.match(styles, /\.collection-article-list > \.paginated-posts \{ display:block; width:100%; \}/);
  assert.doesNotMatch(styles, /\.collection-article-list > div \{/);
});

test("Web 開發頁自然收納 JavaScript 路線，文章頁提供具體延伸閱讀", async () => {
  const [collectionPage, readingPage, styles] = await Promise.all([
    readFile(new URL("../app/tech/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/notes/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(collectionPage, /category\.slug === "web-development"/);
  assert.match(collectionPage, /className="javascript-path"/);
  assert.match(collectionPage, /JavaScript 基礎路線/);
  assert.match(readingPage, /className="related-reading"/);
  assert.match(readingPage, /先建立前一個概念/);
  assert.match(readingPage, /接著理解下一個概念/);
  assert.match(styles, /\.javascript-path/);
  assert.match(styles, /\.related-reading/);
});

test("空的頂層書架暫停索引並依文章狀態加入 sitemap", async () => {
  const [experience, travel, sitemap] = await Promise.all([
    readFile(new URL("../app/experience/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/travel/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  ]);
  for (const source of [experience, travel]) {
    assert.match(source, /robots: posts\.length \? undefined : \{ index: false, follow: true \}/);
  }
  assert.match(sitemap, /publishedCategories/);
  assert.match(sitemap, /\["experience", "travel"\]/);
  assert.doesNotMatch(sitemap, /publicRoutes = \[[^\]]*"\/experience"/);
});

test("關於頁補上 Dennis 作者介紹與 ProfilePage 資料", async () => {
  const about = await readFile(new URL("../app/about/page.tsx", import.meta.url), "utf8");
  assert.match(about, /"@type": "ProfilePage"/);
  assert.match(about, /"@type": "Person"/);
  assert.match(about, /我是 Dennis/);
  assert.match(about, /JavaScript、Web 與系統開發/);
  assert.doesNotMatch(about, /@gmail\.com|mailto:/);
});

test("技術總列表與分類列表只更新下方文章並使用前端頁碼", async () => {
  const [pagination, techPage, collectionPage, styles] = await Promise.all([
    readFile(new URL("../app/components/PaginatedPostList.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tech/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tech/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(pagination, /"use client"/);
  assert.match(pagination, /pageSize = 5/);
  assert.match(pagination, /posts\.slice\(startIndex, startIndex \+ pageSize\)/);
  assert.match(pagination, /aria-label="文章分頁"/);
  assert.match(pagination, /aria-current=\{pageNumber === currentPage \? "page" : undefined\}/);
  assert.doesNotMatch(pagination, /location|router|href=/);
  assert.match(techPage, /<PaginatedPostList posts=\{posts\}/);
  assert.match(collectionPage, /<PaginatedPostList posts=\{posts\}/);
  assert.match(styles, /\.article-pagination \{/);
});

test("公開文章清單只讀取列表所需欄位", async () => {
  const [posts, publicPosts] = await Promise.all([
    readFile(new URL("../app/lib/posts.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/public-posts.ts", import.meta.url), "utf8"),
  ]);
  assert.match(posts, /substr\(content, 1, 1600\) AS content_preview/);
  assert.match(posts, /listPublishedPostSummaries/);
  assert.match(publicPosts, /safeListPublishedPostSummaries/);
});

test("文章摘要優先保留具體文案，過短摘要才依文章內容與書架重建", async () => {
  const seo = await readFile(new URL("../app/lib/seo.ts", import.meta.url), "utf8");
  assert.match(seo, /normalized\.length < 14/);
  assert.match(seo, /contentBasedDescription\(post\.contentPreview \?\? post\.content \?\? "", post\.category, post\.title\)/);
  assert.match(seo, /category === "travel" \|\| category === "experience"/);
  assert.match(seo, /沿途的風景、活動體驗與當下感受/);
  assert.doesNotMatch(seo, /核心概念、程式碼範例與常見使用情境/);
});

test("公開頁面預熱站內連結並提供立即的跳轉回饋", async () => {
  const [layout, speedup, worker, styles] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/NavigationSpeedup.tsx", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /<NavigationSpeedup \/>/);
  assert.match(speedup, /pointerover/);
  assert.match(speedup, /fetch\(link\.href/);
  assert.match(speedup, /route-changing/);
  assert.match(worker, /s-maxage=60, stale-while-revalidate=300/);
  assert.match(styles, /\.route-changing \.route-progress/);
});

test("技術分類不再顯示 Linux", async () => {
  const tech = await readFile(new URL("../app/content/tech.ts", import.meta.url), "utf8");
  assert.doesNotMatch(tech, /Linux/);
});

test("全站套用指定字體並放寬首頁與技術版面", async () => {
  const [styles, layout] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(styles, /@font-face[\s\S]*font-family: "jf-openhuninn"/);
  assert.match(styles, /\/fonts\/jf-openhuninn-2\.1\.woff2/);
  assert.match(styles, /\.hero \{ width: min\(1400px/);
  assert.match(styles, /\.tech-hero \{ width:min\(1320px/);
  assert.match(styles, /\.series-nav \{[^}]*gap:0/);
  assert.match(styles, /\.hero-copy h1[^}]*3\.15rem/);
  assert.match(styles, /\.published-reading > header h1[^}]*3\.35rem/);
  assert.match(styles, /body, body \*, body \*::before, body \*::after \{ font-family:var\(--site-font\) !important/);
  assert.match(layout, /rel="preload"[^>]*jf-openhuninn-2\.1\.woff2/);
});

test("上方導覽固定並放大主要閱讀文字", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.site-header, \.inner-topbar \{ position:sticky; top:0; z-index:50; \}/);
  assert.match(styles, /\.site-header nav \{ font-size:\.98rem; \}/);
  assert.match(styles, /\.inner-nav \{ font-size:1rem; \}/);
  assert.match(styles, /\.series-nav strong \{ font-size:1\.02rem; \}/);
  assert.match(styles, /\.safe-markdown \{ font-size:1\.12rem; line-height:2\.05; \}/);
  assert.match(styles, /\.published-reading > header div \{ font-size:1\.16rem; \}/);
  assert.match(styles, /\.published-reading > footer, \.reading-footer, \.collection-footer \{ font-size:\.92rem; \}/);
});

test("平板與手機使用置中貓咪與漢堡選單", async () => {
  const [topbar, styles] = await Promise.all([
    readFile(new URL("../app/TopBar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(topbar, /useRef, useState/);
  assert.match(topbar, /id="inner-navigation"/);
  assert.match(topbar, /className=\{`inner-nav \$\{menuOpen \? "open" : ""\}`\}/);
  assert.match(topbar, /aria-expanded=\{menuOpen\}/);
  assert.match(topbar, /aria-controls="inner-navigation"/);
  assert.match(topbar, /className=\{`menu-toggle \$\{menuOpen \? "open" : ""\}`\}/);
  assert.match(styles, /\.menu-toggle \{ display:none; \}/);
  assert.match(styles, /@media \(max-width:1100px\)[\s\S]*?\.topbar-cat \{ left:50%; right:auto; transform:translateX\(-50%\) scale\(\.9\)/);
  assert.match(styles, /@media \(max-width:1100px\)[\s\S]*?\.menu-toggle \{[^}]*display:flex/);
  assert.match(styles, /@media \(max-width:1100px\)[\s\S]*?\.inner-nav\.open \{ opacity:1; visibility:visible; pointer-events:auto/);
  assert.match(styles, /@media \(max-width:1100px\)[\s\S]*?\.series-nav \{[^}]*overflow-x:auto/);
  assert.match(styles, /@media \(max-width:520px\)[\s\S]*?\.inner-nav \{ left:12px; right:12px; width:auto; grid-template-columns:1fr/);
});

test("手機文章系列使用完整可見的二加三排列", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.series-nav \{ display:grid; grid-template-columns:repeat\(6,minmax\(0,1fr\)\); overflow:visible; \}/);
  assert.match(css, /\.series-nav a:nth-child\(-n\+2\) \{ grid-column:span 3;/);
  assert.match(css, /\.series-nav a:nth-child\(n\+3\) \{ grid-column:span 2;/);
});

test("首頁與內頁黑貓維持自然趴姿、全黑耳朵與柔和尾巴", async () => {
  const [catWindow, topbar, styles] = await Promise.all([
    readFile(new URL("../app/CatWindow.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/TopBar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(catWindow, /className="cat-tail"/);
  assert.match(catWindow, /className="cat-tail-tip"/);
  assert.match(catWindow, /className="paw paw-left"/);
  assert.match(topbar, /className="topbar-tail"/);
  assert.match(topbar, /className="topbar-tail-tip"/);
  assert.match(styles, /\.ear::after \{ display:none; \}/);
  assert.match(styles, /\.cat-body \{[^}]*animation:cat-breathe/);
  assert.match(styles, /\.cat \{[^}]*left: auto; right: 4%; bottom: 82px/);
  assert.match(styles, /\.cat-body \{[^}]*left: 112px; right: 32px[^}]*height: 112px/);
  assert.match(styles, /\.cat-body::before \{[^}]*left:-31px[^}]*width:96px; height:91px/);
  assert.match(styles, /\.cat-head \{[^}]*left: 16px; top: 48px/);
  assert.match(styles, /\.paw \{[^}]*z-index:4[^}]*width:88px; height:40px/);
  assert.match(styles, /\.paw-left \{ z-index:5; left:94px; transform:rotate\(7deg\); \} \.paw-right \{ left:147px/);
  assert.match(styles, /\.cat-tail \{[^}]*right:28px; top:128px; width:29px; height:108px[^}]*border-radius:999px[^}]*transform:rotate\(7\.5deg\)/);
  assert.doesNotMatch(styles, /\.cat-tail \{[^}]*animation:/);
  assert.match(styles, /\.cat-tail-tip \{[^}]*right:0; top:72px; width:102px; height:100px[^}]*border-right:27px solid #08080a[^}]*border-bottom:27px solid #08080a[^}]*transform-origin:calc\(100% - 14px\) 8px[^}]*animation:cat-tail-tip-rest/);
  assert.match(styles, /@keyframes cat-tail-tip-rest \{ 0%,100% \{ transform:rotate\(0deg\); \} 50% \{ transform:rotate\(2\.4deg\); \} \}/);
  assert.doesNotMatch(styles, /\.cat-tail::before|\.cat-tail::after/);
  assert.match(styles, /\.topbar-tail \{[^}]*right:3px; top:47px; width:10px; height:32px[^}]*border-radius:999px[^}]*transform:rotate\(7deg\)/);
  assert.doesNotMatch(styles, /\.topbar-tail \{[^}]*animation:/);
  assert.match(styles, /\.topbar-tail-tip \{[^}]*right:0; top:20px; width:38px; height:30px[^}]*border-right:9px solid #09090b[^}]*border-bottom:9px solid #09090b[^}]*animation:topbar-tail-tip-rest/);
  assert.match(styles, /@keyframes topbar-tail-tip-rest \{ 0%,100% \{ transform:rotate\(0deg\); \} 50% \{ transform:rotate\(2\.4deg\); \} \}/);
  assert.doesNotMatch(styles, /\.topbar-tail::after/);
  assert.match(styles, /prefers-reduced-motion:[^)]+\)[\s\S]*?\.cat-body, \.cat-head, \.cat-tail-tip, \.topbar-tail-tip \{ animation:none; \}/);
});

test("所有三區塊標題統一為標題在上、標示與說明在下", async () => {
  const [styles, home, articles, tech, quickLook, experience, travel, about] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    renderHtml("/"),
    renderHtml("/articles"),
    renderHtml("/tech"),
    renderHtml("/tech/quick-look"),
    renderHtml("/experience"),
    renderHtml("/travel"),
    renderHtml("/about"),
  ]);

  assert.match(home, /class="portal-heading"/);
  assert.match(articles, /class="inner-heading"/);
  assert.match(articles, /class="article-hub-heading"/);
  assert.match(tech, /class="tech-hero"/);
  for (const html of [quickLook, experience, travel, about]) assert.match(html, /class="inner-heading"/);

  assert.match(styles, /\.inner-heading,\s*\.portal-heading,\s*\.tech-hero,\s*\.article-hub-heading \{\s*grid-template-columns:minmax\(0,1fr\) minmax\(280px,1fr\);\s*grid-template-areas:\s*"title title"\s*"label description"/);
  assert.match(styles, /\.inner-heading h1,\s*\.portal-heading h2,\s*\.tech-hero h1,\s*\.article-hub-heading h2 \{ grid-area:title; \}/);
  assert.match(styles, /\.inner-heading > span,[\s\S]*?\.article-hub-heading > span \{\s*grid-area:description;\s*justify-self:end;[\s\S]*?text-align:right/);
  assert.match(styles, /@media \(max-width:760px\)[\s\S]*?grid-template-areas:\s*"title"\s*"label"\s*"description"/);
});

test("文章總覽與四個系列頁形成完整導覽", async () => {
  const [articlesHtml, legacyNotesHtml, seriesNav] = await Promise.all([
    renderHtml("/articles"),
    renderHtml("/notes"),
    readFile(new URL("../app/components/SeriesNav.tsx", import.meta.url), "utf8"),
  ]);
  for (const html of [articlesHtml, legacyNotesHtml]) {
    assert.match(html, />文章總覽</);
    assert.match(html, /href="\/tech"/);
    assert.match(html, /href="\/tech\/quick-look"/);
    assert.match(html, /href="\/experience"/);
    assert.match(html, /href="\/travel"/);
  }
  assert.match(seriesNav, /aria-current=\{item\.key === current \? "page"/);
  assert.match(seriesNav, /aria-label="文章系列"/);
});

test("公開頁面一律使用可完整載入的站內超連結", async () => {
  const [home, topbar, reading, techReading] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/TopBar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/notes/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tech/[slug]/page.tsx", import.meta.url), "utf8"),
  ]);
  for (const source of [home, topbar, reading, techReading]) assert.doesNotMatch(source, /from "next\/link"|<Link/);
  assert.match(topbar, /<a className="inner-brand" href="\/"[^>]*>/);
  assert.match(reading, /<a href="\/">返回首頁<\/a>/);
  assert.match(reading, /<a href="\/articles">查看文章總覽<\/a>/);
});

test("搜尋引擎可讀取公開網站規則與網站地圖", async () => {
  const [robotsResponse, sitemapResponse] = await Promise.all([render("/robots.txt"), render("/sitemap.xml")]);
  assert.equal(robotsResponse.status, 200);
  assert.equal(sitemapResponse.status, 200);
  const [robots, sitemap] = await Promise.all([robotsResponse.text(), sitemapResponse.text()]);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Disallow: \/studio/);
  assert.match(robots, /Sitemap: https:\/\/dennisnightnotes\.com\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/dennisnightnotes\.com\/articles<\/loc>/);
  assert.doesNotMatch(sitemap, /\/studio/);
  assert.doesNotMatch(sitemap, /\/tech\/page/);
});

test("品牌、文章結構化資料與不存在頁面的索引訊號一致", async () => {
  const [layout, reading, techRoute, missingResponse] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/notes/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tech/[slug]/page.tsx", import.meta.url), "utf8"),
    render("/tech/page"),
  ]);
  assert.match(layout, /applicationName: siteName/);
  assert.match(layout, /siteName,/);
  assert.doesNotMatch(layout + reading + techRoute, /夜行手札/);
  assert.match(reading, /"@type": "BlogPosting"/);
  assert.match(reading, /"@type": "BreadcrumbList"/);
  assert.match(reading, /postSeoDescription\(post\)/);
  assert.match(techRoute, /if \(!article\) notFound\(\)/);
  assert.equal(missingResponse.status, 404);
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
  const [sessionRoute, logoutRoute] = await Promise.all([
    readFile(new URL("../app/api/studio/session/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/logout/route.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(sessionRoute, /Response\.redirect/);
  assert.match(sessionRoute, /new Response\(null, \{ status: 303, headers \}\)/);
  assert.match(sessionRoute, /headers\.set\("Set-Cookie", cookie\)/);
  assert.match(sessionRoute, /"Cache-Control": "no-store"/);
  assert.doesNotMatch(logoutRoute, /Response\.redirect/);
  assert.match(logoutRoute, /"Set-Cookie": expiredStudioSessionCookie\(request\)/);
  assert.match(logoutRoute, /new Response\(null, \{ status: 303, headers \}\)/);
});

test("編輯室登入按鈕與工作階段使用同一個伺服器狀態", async () => {
  const [page, login, editor, sessionRoute, auth, styles] = await Promise.all([
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/StudioLogin.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/StudioClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/session/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/studio-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<StudioLogin clientId=\{config\.clientId\} loginUri=\{loginUri\} \/>/);
  assert.match(page, /目前未登入/);
  assert.match(page, /sessionExpiresAt=\{session\.expiresAt\}/);
  assert.doesNotMatch(page, /g_id_onload|g_id_signin|<script src="https:\/\/accounts\.google\.com/);
  assert.match(login, /accounts\.google\.com\/gsi\/client/);
  assert.match(login, /identity\.renderButton/);
  assert.match(login, /重新載入登入按鈕/);
  assert.match(editor, /fetch\("\/api\/studio\/session"/);
  assert.match(editor, /visibilitychange/);
  assert.match(editor, /response\.status === 401/);
  assert.match(editor, /window\.location\.replace\("\/studio\?error=expired"\)/);
  assert.match(editor, /className="studio-session-state"/);
  assert.match(sessionRoute, /export async function GET\(request: Request\)/);
  assert.match(sessionRoute, /status: session \? 200 : 401/);
  assert.match(sessionRoute, /expiredStudioSessionCookie\(request\)/);
  assert.match(auth, /expiresAt: payload\.exp \* 1000/);
  assert.match(styles, /\.studio-login-state \{[^}]*display:flex/);
  assert.match(styles, /\.studio-session-state \{[^}]*display:inline-flex/);
});

test("文章內容與照片採安全輸出及版本保存", async () => {
  const [markdown, mediaRoute, initialMigration, topicMigration, collectionMigration] = await Promise.all([
    readFile(new URL("../app/components/SafeMarkdown.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/media/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_nappy_blur.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_condemned_gamma_corps.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0002_premium_stranger.sql", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(markdown, /dangerouslySetInnerHTML/);
  assert.match(mediaRoute, /8 \* 1024 \* 1024/);
  assert.match(mediaRoute, /output\(\{ format: "image\/webp"/);
  assert.match(initialMigration, /CREATE TABLE `posts`/);
  assert.match(initialMigration, /CREATE TABLE `post_revisions`/);
  assert.match(initialMigration, /CREATE TABLE `media_assets`/);
  assert.match(topicMigration, /ALTER TABLE `posts` ADD `topic`/);
  assert.match(topicMigration, /ALTER TABLE `post_revisions` ADD `topic`/);
  assert.match(collectionMigration, /ALTER TABLE `posts` ADD `tech_collection`/);
  assert.match(collectionMigration, /UPDATE `posts` SET `tech_collection`/);
  assert.match(collectionMigration, /'web-development'/);
});

test("studio is restricted to the private Cloudflare Access hostname", async () => {
  const [gateway, runtime, page, sessionRoute, postsRoute, mediaRoute, logoutRoute, postRoute] = await Promise.all([
    readFile(new URL("../app/lib/studio-gateway.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/runtime.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/session/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/posts/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/media/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/logout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/studio/posts/[id]/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(runtime, /STUDIO_HOST\?: string/);
  assert.match(runtime, /CF_ACCESS_TEAM_DOMAIN\?: string/);
  assert.match(runtime, /CF_ACCESS_AUD\?: string/);
  assert.match(gateway, /cf-access-jwt-assertion/);
  assert.match(gateway, /cdn-cgi\/access\/certs/);
  assert.match(gateway, /actualHost !== expectedHost/);
  assert.match(gateway, /allowedEmails\.has\(email\)/);
  assert.match(page, /hasStudioGatewayAccess\(requestHeaders\)/);
  assert.match(page, /notFound\(\)/);
  for (const route of [sessionRoute, postsRoute, mediaRoute, logoutRoute, postRoute]) {
    assert.match(route, /hasStudioGatewayAccess\(request\.headers\)/);
    assert.match(route, /studioNotFoundResponse\(\)/);
  }
});
