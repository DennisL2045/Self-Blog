import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "夜行手記｜寫給還醒著的人",
  description: "生活、閱讀與深夜散步的個人手記。",
  openGraph: {
    title: "夜行手記｜寫給還醒著的人",
    description: "生活、閱讀與深夜散步的個人手記。",
    locale: "zh_TW",
    type: "website",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "夜行手記——趴在夜晚窗台上的大眼貓" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "夜行手記｜寫給還醒著的人",
    description: "生活、閱讀與深夜散步的個人手記。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
