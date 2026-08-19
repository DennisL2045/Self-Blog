export type TechCategory = {
  slug: string;
  name: string;
  english: string;
  summary: string;
  topics: string[];
};

export type TechSection = {
  heading: string;
  paragraphs: string[];
  code?: string;
  language?: string;
  callout?: string;
};

export type TechArticle = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  categoryName: string;
  tags: string[];
  level: "入門" | "基礎" | "進階";
  readingTime: string;
  updatedAt: string;
  sections: TechSection[];
};

export const techCategories: TechCategory[] = [
  {
    slug: "web-development",
    name: "Web 開發",
    english: "Web development",
    summary: "從 JavaScript、瀏覽器到 React 與 Vue，理解畫面背後真正發生的事。",
    topics: ["JavaScript", "瀏覽器", "HTTP", "React", "Vue"],
  },
  {
    slug: "backend-data",
    name: "後端與資料",
    english: "Backend & data",
    summary: "整理 API、權限、SQL、索引與資料一致性的設計思路。",
    topics: ["API", "Authentication", "SQL", "Transaction"],
  },
  {
    slug: "programming",
    name: "程式設計",
    english: "Programming",
    summary: "用可執行範例認識資料結構、演算法、測試與重構方法。",
    topics: ["資料結構", "演算法", "測試", "重構"],
  },
  {
    slug: "systems-ops",
    name: "系統與維運",
    english: "Systems & operations",
    summary: "從作業系統與網路出發，延伸到容器、部署、監控及排錯。",
    topics: ["Linux", "網路", "Docker", "Kubernetes", "CI/CD"],
  },
  {
    slug: "ai-engineering",
    name: "AI 工程",
    english: "AI engineering",
    summary: "記錄 RAG、Embedding、LLM 系統、安全治理與 Agent 的實務取捨。",
    topics: ["RAG", "LLM", "Embedding", "AI 安全"],
  },
  {
    slug: "smart-manufacturing",
    name: "智慧製造",
    english: "Smart manufacturing",
    summary: "理解 Edge、OT／IT、設備資料流與工廠 AI 系統的可靠性設計。",
    topics: ["Edge", "IoT", "OT／IT", "設備監控"],
  },
];

export const techArticles: TechArticle[] = [
  {
    slug: "javascript-async-flow",
    title: "JavaScript 非同步流程是如何運作的",
    summary: "從 Call Stack、Promise 到 Microtask，用一段可執行程式理解 Event Loop 的順序。",
    category: "web-development",
    categoryName: "Web 開發",
    tags: ["JavaScript", "Promise", "Event Loop"],
    level: "基礎",
    readingTime: "8 分鐘",
    updatedAt: "2026.08.19",
    sections: [
      {
        heading: "這個概念解決什麼問題",
        paragraphs: [
          "JavaScript 的主要執行緒一次只能完成一件事，但網路請求、計時器與使用者操作不能因此卡住整個畫面。非同步機制讓耗時工作先交給環境處理，完成後再安排回主執行緒。",
          "理解執行順序，可以避免畫面資料被舊請求覆蓋、Loading 狀態錯亂，以及明明設定零秒卻沒有立即執行的困惑。",
        ],
      },
      {
        heading: "Call Stack 與工作佇列",
        paragraphs: [
          "同步程式會依序進入 Call Stack。當瀏覽器完成非同步工作後，對應的 callback 不會直接插進正在執行的程式，而是先進入等待佇列。Event Loop 會在 Call Stack 清空後安排下一批工作。",
        ],
        callout: "setTimeout(fn, 0) 代表最短等待時間，不代表立即執行。",
      },
      {
        heading: "Microtask 為什麼比較早執行",
        paragraphs: [
          "Promise.then、queueMicrotask 等工作通常進入 Microtask Queue；setTimeout 則屬於下一輪 Macrotask。同步程式完成後，環境會先清空 Microtask，再進入下一個 Macrotask。",
        ],
        code: `console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");

// 輸出順序：A、D、C、B`,
        language: "javascript",
      },
      {
        heading: "實務上需要注意什麼",
        paragraphs: [
          "非同步流程不只要處理成功，也要處理失敗、取消和競態條件。搜尋條件快速改變時，可以用 AbortController 取消舊請求，或只接受最新請求的結果。",
          "大量 Microtask 也可能延後畫面更新，因此非同步不等於永遠不會阻塞。重要的是知道工作被排在哪裡，以及何時應該讓出主執行緒。",
        ],
      },
    ],
  },
  {
    slug: "api-idempotency",
    title: "API 冪等性：避免同一筆操作被執行兩次",
    summary: "以建立訂單為例，理解重試、Idempotency Key、唯一鍵與交易之間的關係。",
    category: "backend-data",
    categoryName: "後端與資料",
    tags: ["API", "Idempotency", "Transaction"],
    level: "進階",
    readingTime: "10 分鐘",
    updatedAt: "2026.08.19",
    sections: [
      {
        heading: "什麼是冪等性",
        paragraphs: [
          "同一個操作執行一次或多次，最後得到相同結果，就具有冪等性。讀取資料通常天然具有冪等性，但建立訂單、扣庫存或付款等操作，如果重送就可能產生重複結果。",
        ],
      },
      {
        heading: "為什麼只鎖住按鈕不夠",
        paragraphs: [
          "前端停用按鈕能減少重複點擊，卻無法處理網路逾時後的自動重試、使用者重新整理、不同裝置同時操作，或惡意直接呼叫 API。真正的保護必須位於後端。",
        ],
        callout: "前端負責改善體驗；後端負責維持資料正確性。",
      },
      {
        heading: "Idempotency Key 的基本流程",
        paragraphs: [
          "客戶端為一次業務操作建立唯一識別碼。後端收到請求後，先檢查這個識別碼是否已處理；若已完成就回傳原結果，若尚未處理才執行並保存結果。",
        ],
        code: `POST /orders
Idempotency-Key: 7d5c8e4a-...

{
  "productId": "P-1024",
  "quantity": 1
}`,
        language: "http",
      },
      {
        heading: "仍然需要資料庫保護",
        paragraphs: [
          "Key 的保存與業務資料寫入要放在可靠的交易邊界中，也可以搭配唯一索引作為最後防線。否則兩個同時抵達的請求仍可能都在檢查後進入建立流程。",
          "設計時還要定義 Key 的有效期限、相同 Key 卻帶入不同內容時如何拒絕，以及失敗中的請求能不能安全重試。",
        ],
      },
    ],
  },
  {
    slug: "database-index-basics",
    title: "資料庫索引不是越多越好",
    summary: "理解索引加速查詢的原因，以及寫入成本、選擇性與 Execution Plan 的判讀方向。",
    category: "backend-data",
    categoryName: "後端與資料",
    tags: ["SQL", "Index", "效能"],
    level: "基礎",
    readingTime: "9 分鐘",
    updatedAt: "2026.08.19",
    sections: [
      {
        heading: "索引解決什麼問題",
        paragraphs: [
          "沒有合適索引時，資料庫可能必須逐列檢查整張表。索引建立額外的查找結構，讓資料庫能縮小掃描範圍，也能協助排序與表格關聯。",
        ],
      },
      {
        heading: "為什麼加了索引仍然可能很慢",
        paragraphs: [
          "查詢條件選擇性太低、欄位被函式包住、型別轉換、回傳資料比例太高，或索引順序不符合查詢方式，都可能讓最佳化器選擇不使用索引。",
        ],
        code: `-- 可能難以利用 created_at 的索引
WHERE DATE(created_at) = '2026-08-19'

-- 改用可直接比較的範圍
WHERE created_at >= '2026-08-19'
  AND created_at <  '2026-08-20'`,
        language: "sql",
      },
      {
        heading: "索引的成本",
        paragraphs: [
          "每個索引都需要額外空間。新增、更新和刪除資料時，資料庫也要維護索引，因此讀取變快可能換來寫入變慢。索引策略必須依實際查詢與資料分布決定。",
        ],
      },
      {
        heading: "如何驗證是否有效",
        paragraphs: [
          "不要只看執行計畫中的成本百分比。應一起觀察實際與估計筆數、掃描方式、讀取量、排序、回表查找及整體執行時間。不同資料庫產品的索引結構與術語也可能不同。",
        ],
        callout: "先量測，再調整；不要因為看到慢查詢就盲目增加索引。",
      },
    ],
  },
];

export const quickTerms = [
  { name: "Git", type: "版本控制", summary: "追蹤程式碼變更、建立分支並合併多人開發成果。", usage: "功能開發、Code Review、版本回退" },
  { name: "Postman", type: "API 工具", summary: "建立、保存與測試 HTTP API 請求，不必先完成前端畫面。", usage: "API 驗證、環境變數、測試集合" },
  { name: "Docker", type: "容器", summary: "把程式與依賴包成可重複執行的環境，降低不同電腦之間的差異。", usage: "本機開發、部署、CI/CD" },
  { name: "Redis", type: "記憶體資料庫", summary: "提供速度很快的鍵值資料存取，但不能把所有資料都無條件只放在記憶體。", usage: "快取、Session、Rate Limit、佇列" },
  { name: "Nginx", type: "Web Server", summary: "接收外部流量，提供靜態檔案，也能把請求轉送到後端服務。", usage: "反向代理、TLS、負載分配" },
  { name: "ORM", type: "資料存取", summary: "用程式語言物件或查詢建構器操作資料庫，減少重複的資料映射工作。", usage: "CRUD、Migration、型別安全查詢" },
  { name: "JWT", type: "身分憑證", summary: "帶有簽章的 Token 格式，可承載聲明，但本身不等於完整的登入與權限系統。", usage: "API 身分傳遞、短效 Access Token" },
  { name: "CI/CD", type: "自動化流程", summary: "在程式變更後自動建置、測試與準備部署，降低人工步驟的不一致。", usage: "品質檢查、版本發布、自動回退" },
  { name: "Kubernetes", type: "容器編排", summary: "管理多個容器實例的部署、擴縮、更新與服務發現。", usage: "多服務平台、高可用部署" },
] as const;

export function getTechArticle(slug: string) {
  return techArticles.find((article) => article.slug === slug);
}
