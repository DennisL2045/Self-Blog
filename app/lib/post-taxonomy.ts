export const postTaxonomy = {
  tech: {
    label: "技術成長",
    description: "程式語言、前後端、資料庫與系統設計的深入理解",
    topics: [
      { value: "javascript", label: "JavaScript" },
      { value: "web-frontend", label: "Web／前端" },
      { value: "backend-api", label: "後端／API" },
      { value: "database", label: "資料庫／SQL" },
      { value: "programming", label: "程式設計" },
      { value: "system-ops", label: "系統／維運" },
      { value: "ai-engineering", label: "AI 工程" },
      { value: "general-tech", label: "其他技術" },
    ],
  },
  "quick-look": {
    label: "簡單看看",
    description: "工具名詞與常見使用情境的快速解說",
    topics: [
      { value: "dev-tools", label: "開發工具" },
      { value: "frontend-terms", label: "前端名詞" },
      { value: "backend-terms", label: "後端名詞" },
      { value: "data-ai-terms", label: "資料／AI 名詞" },
      { value: "system-terms", label: "系統／部署名詞" },
    ],
  },
  experience: {
    label: "個人經歷",
    description: "專案、學習歷程與回顧",
    topics: [
      { value: "project", label: "工作／專案" },
      { value: "learning", label: "學習歷程" },
      { value: "reflection", label: "心得回顧" },
    ],
  },
  travel: {
    label: "出遊手札",
    description: "地點、照片與旅途記錄",
    topics: [
      { value: "taiwan-travel", label: "台灣旅行" },
      { value: "overseas-travel", label: "海外旅行" },
      { value: "day-trip", label: "散步／一日遊" },
    ],
  },
} as const;

export type PostCategory = keyof typeof postTaxonomy;
export type PostTopic = (typeof postTaxonomy)[PostCategory]["topics"][number]["value"];

export const postCategories = Object.keys(postTaxonomy) as PostCategory[];
export const postTopics = Object.values(postTaxonomy).flatMap((category) => category.topics.map((topic) => topic.value)) as PostTopic[];

export function categoryLabel(category: PostCategory) {
  return postTaxonomy[category].label;
}

export function topicsForCategory(category: PostCategory) {
  return postTaxonomy[category].topics as readonly { value: PostTopic; label: string }[];
}

export function defaultTopicForCategory(category: PostCategory): PostTopic {
  return topicsForCategory(category)[0].value;
}

export function topicBelongsToCategory(category: PostCategory, topic: PostTopic) {
  return topicsForCategory(category).some((item) => item.value === topic);
}

export function topicLabel(topic: PostTopic) {
  for (const category of Object.values(postTaxonomy)) {
    const match = category.topics.find((item) => item.value === topic);
    if (match) return match.label;
  }
  return "其他";
}
