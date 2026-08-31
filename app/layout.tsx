import type { Metadata } from "next";
import { NavigationSpeedup } from "./components/NavigationSpeedup";
import { siteDescription, siteEnglishName, siteName, siteTagline, siteUrl } from "./lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: `${siteName}｜${siteTagline}`,
  description: siteDescription,
  authors: [{ name: "Dennis", url: "/about" }],
  creator: "Dennis",
  publisher: siteName,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  alternates: { canonical: "/" },
  openGraph: {
    title: `${siteName}｜${siteTagline}`,
    description: siteDescription,
    siteName,
    url: "/",
    locale: "zh_TW",
    type: "website",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: `${siteName}（${siteEnglishName}）——趴在夜晚窗台上的大眼貓` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName}｜${siteTagline}`,
    description: siteDescription,
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
