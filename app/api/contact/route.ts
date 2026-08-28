import { getD1, getRuntimeEnv } from "../../lib/runtime";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
  startedAt?: unknown;
};

function json(message: string, status: number) {
  return Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (!origin || origin !== requestUrl.origin) return json("無法確認表單來源，請重新整理頁面後再試。", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json("表單格式不正確。", 415);

  const rawBody = await request.text();
  if (rawBody.length > 12_000) return json("訊息內容太長。", 413);

  let payload: ContactPayload;
  try {
    payload = JSON.parse(rawBody) as ContactPayload;
  } catch {
    return json("表單格式不正確。", 400);
  }

  const name = cleanText(payload.name);
  const email = cleanText(payload.email).toLowerCase();
  const message = cleanText(payload.message);
  const website = cleanText(payload.website);
  const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : 0;
  const elapsed = Date.now() - startedAt;

  if (website) return json("訊息已收到。", 200);
  if (elapsed < 3_000 || elapsed > DAY_MS) return json("請重新整理頁面後再填寫一次。", 400);
  if (!name || name.length > 60) return json("請填寫 60 個字以內的稱呼。", 400);
  if (!validEmail(email)) return json("請填寫可以正常回覆的信箱。", 400);
  if (message.length < 10 || message.length > 4_000) return json("想說的話請填寫 10 到 4,000 個字。", 400);

  const runtime = getRuntimeEnv();
  const apiKey = runtime.RESEND_API_KEY;
  const to = runtime.CONTACT_TO_EMAIL;
  const from = runtime.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return json("聯絡服務正在設定中，請稍後再試。", 503);

  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "unknown";
  const salt = runtime.SESSION_SECRET || "night-notes-contact";
  const [fingerprint, emailHash] = await Promise.all([digest(`${salt}:ip:${ip}`), digest(`${salt}:email:${email}`)]);
  const now = Date.now();
  const database = getD1();

  const [ipResult, emailResult, dailyResult] = await Promise.all([
    database.prepare("SELECT COUNT(*) AS count FROM contact_rate_limits WHERE fingerprint = ? AND created_at >= ?").bind(fingerprint, now - HOUR_MS).first<{ count: number }>(),
    database.prepare("SELECT COUNT(*) AS count FROM contact_rate_limits WHERE email_hash = ? AND created_at >= ?").bind(emailHash, now - HOUR_MS).first<{ count: number }>(),
    database.prepare("SELECT COUNT(*) AS count FROM contact_rate_limits WHERE created_at >= ?").bind(now - DAY_MS).first<{ count: number }>(),
  ]);

  if ((ipResult?.count ?? 0) >= 5 || (emailResult?.count ?? 0) >= 3 || (dailyResult?.count ?? 0) >= 30) {
    return json("今天送出的訊息有點多，請稍後再試。", 429);
  }

  await database.batch([
    database.prepare("INSERT INTO contact_rate_limits (fingerprint, email_hash, created_at) VALUES (?, ?, ?)").bind(fingerprint, emailHash, now),
    database.prepare("DELETE FROM contact_rate_limits WHERE created_at < ?").bind(now - (2 * DAY_MS)),
  ]);

  const safeName = name.replace(/[\r\n]+/g, " ");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `夜行手札網站留言｜${safeName}`,
      text: `稱呼：${name}\n回覆信箱：${email}\n\n想說的話：\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error("Contact email delivery failed", response.status);
    return json("訊息暫時無法送出，請稍後再試。", 502);
  }

  return json("訊息已經送出。", 200);
}
