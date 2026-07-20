import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// =====================================================================
// Supabase クライアント(要件13 / DATA_SOURCE=supabase 本番接続)
// -------------------------------------------------------------------
// 新形式 API キー(sb_publishable_ / sb_secret_)に対応。
// 従来の anon / service_role JWT(eyJ...)も後方互換で受け付ける。
//
// - publishable クライアント: anon 相当。RLS を効かせたユーザー文脈で使用。
//   ユーザーのアクセストークンを Bearer で渡すと、その本人として RLS 適用。
// - secret クライアント: service_role 相当。RLS を回避するためサーバー専用。
//   クライアントへ絶対に露出しないこと。
//
// DATA_SOURCE=seed(既定)では未使用。設定不足時は明示的にエラーにする。
// =====================================================================

type KeyKind = "publishable" | "secret" | "legacy-jwt" | "unknown";

/** キーの種別を先頭プレフィックスから判定する。 */
export function classifyKey(key: string): KeyKind {
  if (key.startsWith("sb_publishable_")) return "publishable";
  if (key.startsWith("sb_secret_")) return "secret";
  // 従来の anon / service_role は JWT(ヘッダは eyJ で始まる)
  if (key.startsWith("eyJ")) return "legacy-jwt";
  return "unknown";
}

export function isSupabaseMode(): boolean {
  return (process.env.DATA_SOURCE ?? "seed") === "supabase";
}

function firstEnv(names: string[]): { name: string; value: string } | null {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return { name, value: value.trim() };
  }
  return null;
}

export function requireSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL が未設定です。DATA_SOURCE=supabase では必須です。",
    );
  }
  return url;
}

/**
 * 公開(publishable / anon)キーを解決する。
 * 新形式 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY を優先し、
 * 従来の NEXT_PUBLIC_SUPABASE_ANON_KEY を後方互換で受け付ける。
 */
export function resolvePublishableKey(): string {
  const found = firstEnv([
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
  if (!found) {
    throw new Error(
      "[supabase] 公開キーが未設定です。NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY(新形式 sb_publishable_…)" +
        "または NEXT_PUBLIC_SUPABASE_ANON_KEY(従来 JWT)を設定してください。",
    );
  }
  // 安全策: シークレットキーを公開スロットに置くと NEXT_PUBLIC_ でクライアントへ露出する。
  if (classifyKey(found.value) === "secret") {
    throw new Error(
      `[supabase] ${found.name} に secret キー(sb_secret_…)が設定されています。` +
        "公開スロットにシークレットキーを置かないでください(クライアントへ露出します)。",
    );
  }
  return found.value;
}

/**
 * シークレット(secret / service_role)キーを解決する。
 * 新形式 SUPABASE_SECRET_KEY を優先し、従来の SUPABASE_SERVICE_ROLE_KEY を後方互換で受け付ける。
 */
function resolveSecretKey(): string {
  const found = firstEnv(["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (!found) {
    throw new Error(
      "[supabase] シークレットキーが未設定です。SUPABASE_SECRET_KEY(新形式 sb_secret_…)" +
        "または SUPABASE_SERVICE_ROLE_KEY(従来 JWT)を設定してください。",
    );
  }
  if (classifyKey(found.value) === "publishable") {
    throw new Error(
      `[supabase] ${found.name} に publishable キー(sb_publishable_…)が設定されています。` +
        "サーバー用スロットには secret キーを設定してください。",
    );
  }
  return found.value;
}

const baseOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
} as const;

/**
 * publishable(anon 相当)クライアント。
 * accessToken を渡すと、そのユーザー本人として RLS が適用される(推奨)。
 * 新形式 sb_publishable_… / 従来 anon JWT のどちらでも動作する。
 */
export function createUserClient(accessToken?: string): SupabaseClient {
  const url = requireSupabaseUrl();
  const key = resolvePublishableKey();
  return createClient(url, key, {
    ...baseOptions,
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

/**
 * secret(service_role 相当)クライアント。RLS を回避するため、権限確認を
 * 自前で行う管理系処理のみで使用すること。クライアントへ絶対に露出しない。
 * 新形式 sb_secret_… / 従来 service_role JWT のどちらでも動作する。
 */
export function createServiceClient(): SupabaseClient {
  const url = requireSupabaseUrl();
  const key = resolveSecretKey();
  return createClient(url, key, baseOptions);
}
