"use client";

import { useState } from "react";

const languageLabels: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  sql: "SQL",
  bash: "Bash",
  shell: "Shell",
  http: "HTTP",
};

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const normalizedLanguage = language?.trim().toLocaleLowerCase("en-US") ?? "";
  const label = languageLabels[normalizedLanguage] ?? language?.trim() ?? "Code";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="markdown-code">
      <header>
        <small>{label}</small>
        <button type="button" onClick={copyCode} aria-live="polite">
          {copyState === "copied" ? "已複製" : copyState === "failed" ? "請手動複製" : "複製程式碼"}
        </button>
      </header>
      <pre><code className={normalizedLanguage ? `language-${normalizedLanguage}` : undefined}>{code}</code></pre>
    </div>
  );
}
