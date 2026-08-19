import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStudioConfiguration, getStudioSession } from "../lib/studio-auth";
import { listStudioPosts, type PostRecord } from "../lib/posts";
import { StudioClient } from "./StudioClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "夜行編輯室",
  robots: { index: false, follow: false, nocache: true },
};

const errors: Record<string, string> = {
  invalid: "登入驗證沒有完成，請重新嘗試。",
  "not-allowed": "這個 Google 帳號不在編輯者白名單中。",
  configuration: "編輯室尚未完成安全設定。",
};

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const config = getStudioConfiguration();
  const session = await getStudioSession();
  const error = errors[(await searchParams).error ?? ""];

  if (!config.ready) {
    return <main className="studio-gate"><section><span>Private studio</span><h1>夜行編輯室尚未啟用</h1><p>資料與圖片空間已經隔離完成。Google Client ID、安全工作階段與至少一個白名單帳號完成設定前，所有編輯功能都會保持關閉。</p></section></main>;
  }

  if (!session) {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
    const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    const loginUri = `${protocol}://${host}/api/studio/session`;
    return (
      <main className="studio-gate">
        <section>
          <span>Private studio</span><h1>夜行編輯室</h1><p>這裡沒有公開入口。請使用已加入白名單的 Google 帳號繼續。</p>
          {error && <div className="studio-login-error" role="alert">{error}</div>}
          <div id="g_id_onload" data-client_id={config.clientId} data-login_uri={loginUri} data-ux_mode="redirect" data-auto_prompt="false" data-itp_support="true" />
          <div className="g_id_signin" data-type="standard" data-theme="filled_black" data-size="large" data-text="signin_with" data-shape="pill" data-logo_alignment="left" />
          <script src="https://accounts.google.com/gsi/client" async defer />
          <small>登入只用來確認身分；網站不會取得 Google Drive、Gmail 或其他帳號資料。</small>
        </section>
      </main>
    );
  }

  let posts: PostRecord[] = [];
  try {
    posts = await listStudioPosts();
  } catch {
    // The editor can still explain the signed-in state while storage is being provisioned.
  }
  return <main className="studio-page"><StudioClient initialPosts={posts} email={session.email} /></main>;
}
