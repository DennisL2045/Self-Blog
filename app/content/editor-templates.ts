import type { PostCategory, PostTopic } from "../lib/post-taxonomy";
import type { TechCollection } from "./tech";

export type EditorTemplate = {
  id: string;
  label: string;
  description: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: PostCategory;
  techCollection: TechCollection | null;
  topic: PostTopic;
};

export const editorTemplates: EditorTemplate[] = [
  {
    id: "javascript-var-let-const",
    label: "JavaScript：var、let、const",
    description: "適合技術概念解說，已整理比較、範例、常見誤解與選擇原則。",
    title: "var、let、const：JavaScript 變數宣告怎麼選？",
    slug: "javascript-var-let-const",
    excerpt: "從作用域、重複宣告、提升與暫時性死區，理解 JavaScript 三種變數宣告方式的差異。",
    category: "tech",
    techCollection: "web-development",
    topic: "javascript",
    content: `## 先說結論

【用 2～3 句話整理這篇文章最重要的選擇原則。】

## 三者快速比較

- \`var\`：【補上作用域與是否能重新宣告。】
- \`let\`：【補上適合使用的情境。】
- \`const\`：【補上「不能重新指定」真正代表的意思。】

## var：函式作用域與提升

【說明 function scope、hoisting，以及他為什麼容易產生不直覺的結果。】

\`\`\`js
function showVarScope() {
  if (true) {
    var message = "hello";
  }

  console.log(message);
}

showVarScope();
\`\`\`

## let：區塊作用域與暫時性死區

【說明 block scope 與 Temporal Dead Zone，並解釋錯誤發生的原因。】

\`\`\`js
if (true) {
  let count = 1;
  count += 1;
  console.log(count);
}
\`\`\`

## const：不能重新指定，不代表內容永遠不變

【用物件或陣列範例說明 binding 與 value 的差異。】

\`\`\`js
const profile = { name: "Milo" };
profile.name = "Luna";

console.log(profile.name);
\`\`\`

## 實際撰寫時怎麼選

1. 【先寫出預設選擇。】
2. 【什麼情況改用 let。】
3. 【是否仍有使用 var 的情境。】

## 常見誤解

> 【放入一個最常被誤會的觀念，並補上精確說法。】

## 小結

【重新連回文章開頭，留下日後能快速複習的 3 個重點。】`,
  },
];

export function getEditorTemplate(id: string) {
  return editorTemplates.find((template) => template.id === id);
}
