import type { Metadata } from "next";
import { NavigationSpeedup } from "./components/NavigationSpeedup";
import { siteUrl } from "./lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "夜行手記｜寫給還醒著的人",
  description: "整理程式技術、個人經歷與出遊記錄的夜間手札。",
  openGraph: {
    title: "夜行手記｜寫給還醒著的人",
    description: "整理程式技術、個人經歷與出遊記錄的夜間手札。",
    locale: "zh_TW",
    type: "website",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "夜行手記——趴在夜晚窗台上的大眼貓" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "夜行手記｜寫給還醒著的人",
    description: "整理程式技術、個人經歷與出遊記錄的夜間手札。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <head><link rel="preload" href="/fonts/jf-openhuninn-2.1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head>
      <body><NavigationSpeedup />{children}</body>
    </html>
  );
}
