"use client";

import { useRef, useState } from "react";
import { SafeMarkdown } from "../components/SafeMarkdown";
import type { PostCategory, PostRecord, PostStatus } from "../lib/posts";

const categoryLabels: Record<PostCategory, string> = {
  tech: "技術成長",
  "quick-look": "簡單看看",
  experience: "個人經歷",
  travel: "出遊手札",
};

const emptyDraft = (): Pick<PostRecord, "title" | "slug" | "excerpt" | "content" | "category" | "status"> => ({
  title: "未命名札記",
  slug: "",
  excerpt: "",
  content: "",
  category: "tech",
  status: "draft",
});

export function StudioClient({ initialPosts, email }: { initialPosts: PostRecord[]; email: string }) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState<PostRecord | null>(initialPosts[0] ?? null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function choose(post: PostRecord) {
    if (dirty && !window.confirm("目前修改尚未儲存，仍要切換文章嗎？")) return;
    setDraft({ ...post });
    setDirty(false);
    setMessage("");
  }

  function change<K extends keyof PostRecord>(key: K, value: PostRecord[K]) {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
    setDirty(true);
  }

  async function createNew() {
    if (dirty && !window.confirm("目前修改尚未儲存，仍要建立新文章嗎？")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/studio/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyDraft()),
      });
      const data = await response.json() as { post?: PostRecord; error?: string };
      if (!response.ok || !data.post) throw new Error(data.error ?? "建立失敗");
      setPosts((current) => [data.post!, ...current]);
      setDraft(data.post);
      setDirty(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "建立失敗");
    } finally {
      setBusy(false);
    }
  }

  async function save(nextStatus?: PostStatus) {
    if (!draft) return;
    setBusy(true);
    setMessage("");
    try {
      const payload = { ...draft, status: nextStatus ?? draft.status };
      const response = await fetch(`/api/studio/posts/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { post?: PostRecord; error?: string };
      if (!response.ok || !data.post) throw new Error(data.error ?? "儲存失敗");
      setPosts((current) => current.map((post) => post.id === data.post!.id ? data.post! : post).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      setDraft(data.post);
      setDirty(false);
      setMessage(nextStatus === "published" ? "文章已發布。" : "變更已安全儲存。" );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "儲存失敗");
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    if (!draft || !window.confirm("文章會移到封存區，不會永久刪除。確定繼續嗎？")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/studio/posts/${draft.id}`, { method: "DELETE" });
      const data = await response.json() as { post?: PostRecord; error?: string };
      if (!response.ok || !data.post) throw new Error(data.error ?? "封存失敗");
      setPosts((current) => current.map((post) => post.id === data.post!.id ? data.post! : post));
      setDraft(data.post);
      setDirty(false);
      setMessage("文章已封存，可由版本紀錄保留先前內容。" );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "封存失敗");
    } finally {
      setBusy(false);
    }
  }

  function applyMarkup(before: string, after = before, placeholder = "文字") {
    const textarea = textareaRef.current;
    if (!textarea || !draft) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = draft.content.slice(start, end) || placeholder;
    const next = `${draft.content.slice(0, start)}${before}${selected}${after}${draft.content.slice(end)}`;
    change("content", next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  async function uploadImage(file?: File) {
    if (!file || !draft) return;
    setBusy(true);
    setMessage("圖片上傳中…");
    try {
      const form = new FormData();
      form.set("image", file);
      form.set("postId", draft.id);
      form.set("alt", file.name.replace(/\.[^.]+$/, ""));
      const response = await fetch("/api/studio/media", { method: "POST", body: form });
      const data = await response.json() as { markdown?: string; error?: string };
      if (!response.ok || !data.markdown) throw new Error(data.error ?? "上傳失敗");
      const separator = draft.content && !draft.content.endsWith("\n") ? "\n\n" : "";
      change("content", `${draft.content}${separator}${data.markdown}\n`);
      setMessage("圖片已插入內容，儲存文章後即可保留關聯。" );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上傳失敗");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="studio-shell">
      <header className="studio-header">
        <div><span>Private writing room</span><h1>夜行編輯室</h1></div>
        <div><small>{email}</small><form action="/api/studio/logout" method="post"><button type="submit">安全登出</button></form></div>
      </header>
      <div className="studio-layout">
        <aside className="studio-sidebar">
          <button className="studio-new" onClick={createNew} disabled={busy}>＋ 新文章</button>
          <nav aria-label="文章草稿">
            {posts.map((post) => (
              <button key={post.id} className={post.id === draft?.id ? "active" : ""} onClick={() => choose(post)}>
                <span>{categoryLabels[post.category]} · {statusLabel(post.status)}</span><strong>{post.title}</strong><small>{new Date(post.updatedAt).toLocaleString("zh-TW")}</small>
              </button>
            ))}
          </nav>
        </aside>
        {draft ? (
          <section className="studio-editor">
            <div className="studio-fields">
              <label><span>標題</span><input value={draft.title} onChange={(event) => change("title", event.target.value)} maxLength={160} /></label>
              <div className="studio-field-row">
                <label><span>分類</span><select value={draft.category} onChange={(event) => change("category", event.target.value as PostCategory)}>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label><span>網址代稱</span><input value={draft.slug} onChange={(event) => change("slug", event.target.value)} placeholder="留白會自動產生" maxLength={80} /></label>
              </div>
              <label><span>文章摘要</span><textarea className="studio-excerpt" value={draft.excerpt} onChange={(event) => change("excerpt", event.target.value)} maxLength={500} /></label>
              <div className="editor-toolbar" aria-label="內容格式工具">
                <button type="button" onClick={() => applyMarkup("## ", "", "段落標題")}>標題</button>
                <button type="button" onClick={() => applyMarkup("**", "**")}>粗體</button>
                <button type="button" onClick={() => applyMarkup("- ", "", "清單項目")}>清單</button>
                <button type="button" onClick={() => applyMarkup("[", "](https://)", "連結文字")}>連結</button>
                <button type="button" onClick={() => applyMarkup("```ts\n", "\n```", "程式碼")}>程式碼</button>
                <label className="image-upload">貼照片<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void uploadImage(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
              </div>
              <label><span>內容</span><textarea ref={textareaRef} className="studio-content" value={draft.content} onChange={(event) => change("content", event.target.value)} placeholder="從這裡開始寫。可以使用上方工具加入標題、清單、程式碼和照片。" /></label>
            </div>
            <aside className="studio-preview"><span>即時預覽</span><SafeMarkdown content={draft.content || "還沒有內容。"} /></aside>
            <footer className="studio-actions">
              <div><span className={`status-dot ${draft.status}`} />{statusLabel(draft.status)}{dirty ? " · 尚未儲存" : " · 已同步"}</div>
              <div><button className="archive" onClick={archive} disabled={busy}>封存</button><button onClick={() => save("draft")} disabled={busy}>儲存草稿</button><button className="publish" onClick={() => save("published")} disabled={busy}>發布文章</button></div>
            </footer>
            {message && <p className="studio-message" role="status">{message}</p>}
          </section>
        ) : (
          <section className="studio-welcome"><span>☾</span><h2>今晚想記下什麼？</h2><p>先建立一篇文章，所有內容都只會保存為草稿，直到你按下發布。</p><button onClick={createNew} disabled={busy}>建立第一篇文章</button>{message && <p role="status">{message}</p>}</section>
        )}
      </div>
    </div>
  );
}

function statusLabel(status: PostStatus) {
  return status === "published" ? "已發布" : status === "archived" ? "已封存" : "草稿";
}
