export type TechCategory = {
  slug: TechCollection;
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

export const techCategories = [
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
] as const;

export type TechCollection = (typeof techCategories)[number]["slug"];

export const techCollections = techCategories.map((category) => category.slug) as TechCollection[];

export function getTechCategory(slug: string) {
  return techCategories.find((category) => category.slug === slug);
}

export function techCollectionLabel(collection: TechCollection | null) {
  return techCategories.find((category) => category.slug === collection)?.name ?? "技術札記";
}

export function defaultTechCollectionForTopic(topic: string): TechCollection {
  if (["backend-api", "database"].includes(topic)) return "backend-data";
  if (topic === "programming") return "programming";
  if (topic === "system-ops") return "systems-ops";
  if (topic === "ai-engineering") return "ai-engineering";
  return "web-development";
}

// 正式技術文章只由私人編輯室發布，過去的版型示範已撤下。
export const techArticles: TechArticle[] = [];

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
