/**
 * ブラウザ用 Supabase クライアント。
 * クライアントコンポーネント（ログインフォーム等）から利用する。
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase の環境変数が設定されていません。");
  }
  return createBrowserClient(url, anon);
}
