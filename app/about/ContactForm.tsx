"use client";

import { useRef, useState, type FormEvent } from "react";

type SubmitState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const startedAt = useRef(Date.now());
  const [state, setState] = useState<SubmitState>("idle");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    const form = event.currentTarget;
    const values = new FormData(form);
    setState("sending");
    setNotice("正在把訊息送往夜裡……");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          message: values.get("message"),
          website: values.get("website"),
          startedAt: startedAt.current,
        }),
      });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message || "訊息暫時無法送出，請稍後再試。");

      form.reset();
      startedAt.current = Date.now();
      setState("success");
      setNotice("訊息已經送出，謝謝你寫信給我。");
    } catch (error) {
      setState("error");
      setNotice(error instanceof Error ? error.message : "訊息暫時無法送出，請稍後再試。");
    }
  }

  return (
    <section className="contact-panel" id="contact" aria-labelledby="contact-title">
      <div className="contact-heading">
        <p>Send a note</p>
        <h2 id="contact-title">聯絡我</h2>
        <span>有想交流的技術、合作或任何想說的話，都可以從這裡送來。</span>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <div className="contact-field-row">
          <label>
            <span>稱呼</span>
            <input name="name" type="text" required maxLength={60} autoComplete="name" placeholder="我該怎麼稱呼你？" />
          </label>
          <label>
            <span>信箱</span>
            <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="方便回覆你的信箱" />
          </label>
        </div>
        <label>
          <span>想說的話</span>
          <textarea name="message" required minLength={10} maxLength={4000} rows={8} placeholder="寫下你想告訴我的內容……" />
        </label>
        <label className="contact-honeypot" aria-hidden="true">
          網站
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <div className="contact-actions">
          <p className={`contact-notice ${state}`} aria-live="polite">{notice}</p>
          <button type="submit" disabled={state === "sending"}>{state === "sending" ? "寄送中……" : "送出訊息"}<span aria-hidden="true">↗</span></button>
        </div>
      </form>
    </section>
  );
}
