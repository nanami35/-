import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// =====================================================================
// Supabase クライアント(要件13 / DATA_SOURCE=supabase 本番接続)
// -------------------------------------------------------------------
// - anon クライアント: RLS を効かせたユーザー文脈のアクセスに使用。
// - service role クライアント: サーバー専用。RLS を回避するため取扱注意。
// DATA_SOURCE=seed(既定)では未使用。設定不足なら明示的にエラーにする。
// =====================================================================

export function isSupabaseMode(): boolean {
  return (process.env.DATA_SOURCE ?? "seed") === "supabase";
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `[supabase] 環境変数 ${name} が未設定です。DATA_SOURCE=supabase では必須です。`,
    );
  }
  return v;
}

/** ユーザーのアクセストークンで RLS を効かせるクライアント(推奨) */
export function createUserClient(accessToken?: string): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anon, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * service role クライアント。RLS を回避するため、権限確認を自前で行う
 * 管理系処理のみで使用すること(クライアントへ絶対に露出しない)。
 */
export function createServiceClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
