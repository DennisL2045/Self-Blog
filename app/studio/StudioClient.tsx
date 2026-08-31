"use client";

import { useEffect, useRef, useState } from "react";
import { SafeMarkdown } from "../components/SafeMarkdown";
import { editorTemplates, getEditorTemplate } from "../content/editor-templates";
import { techCategories, techCollectionLabel, type TechCollection } from "../content/tech";
import type { PostCategory, PostRecord, PostStatus } from "../lib/posts";
import {
  categoryLabel,
  defaultTopicForCategory,
  postTaxonomy,
  topicLabel,
  topicsForCategory,
} from "../lib/post-taxonomy";

const emptyDraft = (): Pick<PostRecord, "title" | "slug" | "excerpt" | "content" | "category" | "techCollection" | "topic" | "status"> => ({
  title: "未命名札記",
  slug: "",
  excerpt: "",
  content: "",
  category: "tech",
  techCollection: "web-development",
  topic: "javascript",
  status: "draft",
});

export function StudioClient({ initialPosts, email, sessionExpiresAt }: { initialPosts: PostRecord[]; email: string; sessionExpiresAt: number }) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState<PostRecord | null>(initialPosts[0] ?? null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [templateId, setTemplateId] = useState(editorTemplates[0]?.id ?? "");
  const [addingCustomTopic, setAddingCustomTopic] = useState(false);
  const [previewMode, setPreviewMode] = useState<"preview" | "edit">("preview");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewBodyRef = useRef<HTMLDivElement>(null);
  const directEditorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRatioRef = useRef(0);

  useEffect(() => {
    let disposed = false;
    let redirecting = false;
    const redirectToLogin = () => {
      if (disposed || redirecting) return;
      redirecting = true;
      window.location.replace("/studio?error=expired");
    };
    const checkSession = async () => {
      if (Date.now() >= sessionExpiresAt) {
        redirectToLogin();
        return;
      }
      try {
        const response = await fetch("/api/studio/session", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        if (response.status === 401) redirectToLogin();
      } catch {
        // A temporary network error is not the same as being signed out.
      }
    };

    const expirationTimer = window.setTimeout(
      redirectToLogin,
      Math.max(0, sessionExpiresAt - Date.now() + 1_000),
    );
    const sessionTimer = window.setInterval(() => void checkSession(), 60_000);
    const handleFocus = () => void checkSession();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void checkSession();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      window.clearTimeout(expirationTimer);
      window.clearInterval(sessionTimer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [sessionExpiresAt]);

  function redirectIfSignedOut(response: Response) {
    if (response.status !== 401) return false;
    window.location.replace("/studio?error=expired");
    return true;
  }

  function choose(post: PostRecord) {
    if (dirty && !window.confirm("目前修改尚未儲存，仍要切換文章嗎？")) return;
    setDraft({ ...post });
    setAddingCustomTopic(false);
    setDirty(false);
    setMessage("");
  }

  function change<K extends keyof PostRecord>(key: K, value: PostRecord[K]) {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
    setDirty(true);
  }

  async function createNew(selectedTemplateId?: string) {
    if (dirty && !window.confirm("目前修改尚未儲存，仍要建立新文章嗎？")) return;
    setBusy(true);
    setMessage("");
    try {
      const template = selectedTemplateId ? getEditorTemplate(selectedTemplateId) : undefined;
      const payload = template
        ? { ...template, id: undefined, description: undefined, label: undefined, status: "draft" as const }
        : emptyDraft();
      const response = await fetch("/api/studio/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (redirectIfSignedOut(response)) return;
      const data = await response.json() as { post?: PostRecord; error?: string };
      if (!response.ok || !data.post) throw new Error(data.error ?? "建立失敗");
      setPosts((current) => [data.post!, ...current]);
      setDraft(data.post);
      setDirty(false);
      setMessage(template ? "JavaScript 文章範本已建立為草稿，不會自動發布。" : "空白草稿已建立。" );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "建立失敗");
    } finally {
      setBusy(false);
    }
  }

  function changeCategory(category: PostCategory) {
    if (!draft) return;
    setDraft({ ...draft, category, techCollection: category === "tech" ? "web-development" : null, topic: defaultTopicForCategory(category) });
    setAddingCustomTopic(false);
    setDirty(true);
  }

  function changeTechCollection(techCollection: TechCollection) {
    if (!draft) return;
    setDraft({ ...draft, techCollection });
    setDirty(true);
  }

  function applyTemplate() {
    if (!draft) return;
    const template = getEditorTemplate(templateId);
    if (!template) return;
    const hasWriting = draft.content.trim() || (draft.title.trim() && draft.title !== "未命名札記") || draft.excerpt.trim();
    if (hasWriting && !window.confirm("套用範本會取代目前的標題、摘要與內容，確定繼續嗎？")) return;
    setDraft({
      ...draft,
      title: template.title,
      slug: template.slug,
      excerpt: template.excerpt,
      content: template.content,
      category: template.category,
      techCollection: template.techCollection,
      topic: template.topic,
      status: "draft",
    });
    setAddingCustomTopic(false);
    setDirty(true);
    setMessage("範本已放入目前草稿；內容尚未儲存，也不會自動發布。" );
  }

  function changePreviewMode(mode: "preview" | "edit") {
    if (mode === previewMode) return;
    const currentPane = previewMode === "preview" ? previewBodyRef.current : directEditorRef.current;
    if (currentPane) {
      const currentScrollableHeight = currentPane.scrollHeight - currentPane.clientHeight;
      previewScrollRatioRef.current = currentScrollableHeight > 0
        ? currentPane.scrollTop / currentScrollableHeight
        : 0;
    }

    setPreviewMode(mode);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const nextPane = mode === "preview" ? previewBodyRef.current : directEditorRef.current;
      if (!nextPane) return;
      const nextScrollableHeight = nextPane.scrollHeight - nextPane.clientHeight;
      if (mode === "edit") directEditorRef.current?.focus({ preventScroll: true });
      nextPane.scrollTop = previewScrollRatioRef.current * Math.max(0, nextScrollableHeight);
    }));
  }

  async function save(nextStatus?: PostStatus) {
    if (!draft) return;
    if (!draft.topic.trim()) {
      setMessage("請先輸入自訂主題名稱。");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const payload = { ...draft, status: nextStatus ?? draft.status };
      const response = await fetch(`/api/studio/posts/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (redirectIfSignedOut(response)) return;
      const data = await response.json() as { post?: PostRecord; error?: string };
      if (!response.ok || !data.post) throw new Error(data.error ?? "儲存失敗");
      setPosts((current) => current.map((post) => post.id === data.post!.id ? data.post! : post).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      setDraft(data.post);
      setAddingCustomTopic(false);
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
      if (redirectIfSignedOut(response)) return;
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
      if (redirectIfSignedOut(response)) return;
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

  const availableTopics = draft ? studioTopicsForCategory(draft.category, posts) : [];

  return (
    <div className="studio-shell">
      <header className="studio-header">
        <div><span>Private writing room</span><h1>夜行編輯室</h1></div>
        <div><span className="studio-session-state"><i />已登入</span><small>{email}</small><form action="/api/studio/logout" method="post"><button type="submit">安全登出</button></form></div>
      </header>
      <div className="studio-layout">
        <aside className="studio-sidebar">
          <div className="studio-create-options">
            <button className="studio-new" onClick={() => void createNew()} disabled={busy}>＋ 空白文章</button>
            <button className="studio-template-new" onClick={() => void createNew("javascript-var-let-const")} disabled={busy}>用 JS 範本開始</button>
          </div>
          <nav aria-label="文章草稿">
            {posts.map((post) => (
              <button key={post.id} className={post.id === draft?.id ? "active" : ""} onClick={() => choose(post)}>
                <span>{categoryLabel(post.category)}{post.techCollection ? ` · ${techCollectionLabel(post.techCollection)}` : ""} · {topicLabel(post.topic)}</span><strong>{post.title}</strong><small>{statusLabel(post.status)} · {new Date(post.updatedAt).toLocaleString("zh-TW")}</small>
              </button>
            ))}
          </nav>
        </aside>
        {draft ? (
          <section className="studio-editor">
            <div className="studio-fields">
              <section className="studio-template-panel" aria-labelledby="studio-template-title">
                <div><span>Writing template</span><strong id="studio-template-title">文章範本</strong><small>只填入草稿，不會自動儲存或發布。</small></div>
                <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} aria-label="選擇文章範本">
                  {editorTemplates.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
                </select>
                <button type="button" onClick={applyTemplate}>套用範本</button>
              </section>
              <label><span>標題</span><input value={draft.title} onChange={(event) => change("title", event.target.value)} maxLength={160} /></label>
              <div className={`studio-field-row studio-taxonomy-row ${draft.category === "tech" ? "has-tech-collection" : ""}`}>
                <label><span>文章書架</span><select value={draft.category} onChange={(event) => changeCategory(event.target.value as PostCategory)}>{Object.entries(postTaxonomy).map(([value, item]) => <option value={value} key={value}>{item.label}</option>)}</select><small className="studio-field-help">發布後會流向這個公開區塊。</small></label>
                {draft.category === "tech" ? <label><span>技術子分類</span><select value={draft.techCollection ?? "web-development"} onChange={(event) => changeTechCollection(event.target.value as TechCollection)}>{techCategories.map((collection) => <option value={collection.slug} key={collection.slug}>{collection.name}</option>)}</select><small className="studio-field-help">決定文章會出現在哪一張技術分類卡片裡。</small></label> : null}
                <div className="studio-topic-field">
                  <label><span>主題類型</span><select value={addingCustomTopic ? "__custom__" : draft.topic} onChange={(event) => {
                    if (event.target.value === "__custom__") {
                      change("topic", "");
                      setAddingCustomTopic(true);
                    } else {
                      change("topic", event.target.value);
                      setAddingCustomTopic(false);
                    }
                  }}>{availableTopics.map((topic) => <option value={topic.value} key={topic.value}>{topic.label}</option>)}<option value="__custom__">＋ 新增自訂主題</option></select></label>
                  {addingCustomTopic ? <label className="studio-custom-topic"><span>自訂主題名稱</span><input value={draft.topic} onChange={(event) => change("topic", event.target.value)} maxLength={40} placeholder="例如：Node.js、資安筆記" /></label> : <small className="studio-field-help">可以選擇既有主題，或新增自己的主題名稱。</small>}
                </div>
              </div>
              <div className="studio-field-row studio-field-row-wide">
                  <label><span>網址代稱</span><input value={draft.slug} onChange={(event) => change("slug", event.target.value)} placeholder="例如：javascript-closure" maxLength={80} /><small className="studio-field-help">建議使用簡短英文關鍵字；正式發布後盡量不要更改，以免舊連結失效。</small></label>
                <label><span>目前流向</span><output className="studio-destination">{categoryLabel(draft.category)} {draft.techCollection ? <><b>→</b> {techCollectionLabel(draft.techCollection)}</> : null} <b>→</b> {topicLabel(draft.topic)}</output></label>
              </div>
              <label><span>文章摘要</span><textarea className="studio-excerpt" value={draft.excerpt} onChange={(event) => change("excerpt", event.target.value)} maxLength={500} /></label>
              <div className="editor-toolbar" aria-label="內容格式工具">
                <button type="button" onClick={() => applyMarkup("## ", "", "段落標題")}>標題</button>
                <button type="button" onClick={() => applyMarkup("**", "**")}>粗體</button>
                <button type="button" onClick={() => applyMarkup("- ", "", "清單項目")}>清單</button>
                <button type="button" onClick={() => applyMarkup("[", "](https://)", "連結文字")}>連結</button>
                <button type="button" onClick={() => applyMarkup(`\`\`\`${codeFenceLanguage(draft.topic)}\n`, "\n```", "程式碼")}>程式碼</button>
                <label className="image-upload">貼照片<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void uploadImage(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
              </div>
              <label><span>內容</span><textarea ref={textareaRef} className="studio-content" value={draft.content} onChange={(event) => change("content", event.target.value)} placeholder="從這裡開始寫。可以使用上方工具加入標題、清單、程式碼和照片。" /></label>
            </div>
            <aside className="studio-preview">
              <header className="studio-preview-header">
                <div><span>{previewMode === "preview" ? "即時預覽" : "直接編輯"}</span><small>{previewMode === "preview" ? "查看文章發布後的閱讀排版" : "內容會和左側文字框即時同步"}</small></div>
                <div className="studio-preview-switch" role="group" aria-label="右側工作區模式">
                  <button type="button" className={previewMode === "preview" ? "active" : ""} aria-pressed={previewMode === "preview"} onClick={() => changePreviewMode("preview")}>預覽</button>
                  <button type="button" className={previewMode === "edit" ? "active" : ""} aria-pressed={previewMode === "edit"} onClick={() => changePreviewMode("edit")}>直接編輯</button>
                </div>
              </header>
              {previewMode === "preview" ? (
                <div ref={previewBodyRef} className="studio-preview-body"><SafeMarkdown content={draft.content || "還沒有內容。"} /></div>
              ) : (
                <textarea
                  ref={directEditorRef}
                  className="studio-direct-editor"
                  value={draft.content}
                  onChange={(event) => change("content", event.target.value)}
                  placeholder="可以直接在右側修改文章內容。Markdown 標題、清單與程式碼標記會完整保留。"
                  aria-label="直接編輯文章內容"
                  spellCheck
                />
              )}
            </aside>
            <footer className="studio-actions">
              <div><span className={`status-dot ${draft.status}`} />{statusLabel(draft.status)}{dirty ? " · 尚未儲存" : " · 已同步"}{draft.status === "published" && !dirty ? <a className="studio-public-link" href={`/notes/${draft.slug}`} target="_blank" rel="noreferrer">查看公開文章 ↗</a> : null}</div>
              <div><button className="archive" onClick={archive} disabled={busy}>封存</button><button onClick={() => save("draft")} disabled={busy}>儲存草稿</button><button className="publish" onClick={() => save("published")} disabled={busy}>發布文章</button></div>
            </footer>
            {message && <p className="studio-message" role="status">{message}</p>}
          </section>
        ) : (
          <section className="studio-welcome"><span>☾</span><h2>從第一篇文章開始</h2><p>可以直接使用「var、let、const」範本。建立後仍是私人草稿，只有按下發布才會出現在「技術成長 → Web 開發 → JavaScript」。</p><div><button onClick={() => void createNew("javascript-var-let-const")} disabled={busy}>用 JS 範本開始</button><button className="secondary" onClick={() => void createNew()} disabled={busy}>建立空白文章</button></div>{message && <p role="status">{message}</p>}</section>
        )}
      </div>
    </div>
  );
}

function statusLabel(status: PostStatus) {
  return status === "published" ? "已發布" : status === "archived" ? "已封存" : "草稿";
}

function studioTopicsForCategory(category: PostCategory, posts: PostRecord[]) {
  const topics = topicsForCategory(category).map((topic) => ({ ...topic }));
  const known = new Set(topics.map((topic) => topic.value));
  for (const post of posts) {
    const value = post.topic.trim();
    if (post.category !== category || !value || known.has(value)) continue;
    topics.push({ value, label: topicLabel(value) });
    known.add(value);
  }
  return topics;
}

function codeFenceLanguage(topic: PostRecord["topic"]) {
  if (topic === "javascript") return "js";
  if (topic === "database") return "sql";
  return "text";
}
