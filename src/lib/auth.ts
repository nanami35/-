/**
 * 認証。環境に応じて自動的に切り替わる。
 *   - Supabase Auth 設定あり → Supabase セッション（メール/パスワード）
 *   - 設定なし               → デモ用 Cookie（アカウント選択）
 *
 * getCurrentUser() が返すアプリユーザーを境界とし、UI は認証実装に依存しない。
 */
import { cookies } from "next/headers";
import { isSupabaseAuthConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findUserById, findUserByAuthId, listSelectableUsers } from "@/lib/users";
import type { User } from "@/types";
import type { Role } from "@/lib/constants";

export const AUTH_COOKIE = "rmos_demo_user";
const DEFAULT_USER_ID = "user_sato";

/** ログイン中ユーザーを取得する（未ログイン時は undefined） */
export async function getCurrentUser(): Promise<User | undefined> {
  // Supabase Auth モード
  if (isSupabaseAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return undefined;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return undefined;
    return findUserByAuthId(user.id);
  }

  // デモモード（Cookie）
  const store = await cookies();
  const id = store.get(AUTH_COOKIE)?.value;
  if (!id) return undefined;
  return findUserById(id);
}

/**
 * ログイン必須。
 * デモモードでは未ログイン時にデフォルトユーザーへフォールバックする。
 * Supabase モードでは (app)/layout の getCurrentUser で未ログインを弾く。
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (user) return user;

  if (!isSupabaseAuthConfigured()) {
    const fallback = await findUserById(DEFAULT_USER_ID);
    if (fallback) return fallback;
  }
  throw new Error("認証が必要です。");
}

/** ロールがメニュー/機能を利用できるか */
export function canAccess(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}

/** ログイン画面で選択可能なアカウント（デモ用） */
export async function getDemoAccounts(): Promise<User[]> {
  return listSelectableUsers();
}
