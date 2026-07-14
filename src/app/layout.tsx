import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "飲食店マーケティングOS",
  description:
    "飲食店の集客・売上向上を支援するマーケティング会社向けの社内業務管理システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
