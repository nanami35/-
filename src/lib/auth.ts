/**
 * デモ用の簡易認証。
 * Cookie に選択したデモユーザー ID を保存し、サーバーコンポーネントから参照する。
 *
 * 本番では Supabase Auth のセッションに置き換える。
 * getCurrentUser() が返すユーザーを境界として UI 側は認証実装に依存しない。
 */
import { cookies } from "next/headers";
import { getUser, getUsers } from "@/lib/data";
import type { User } from "@/types";
import type { Role } from "@/lib/constants";

export const AUTH_COOKIE = "rmos_demo_user";
const DEFAULT_USER_ID = "user_sato";

/** ログイン中ユーザーを取得する（未ログイン時は undefined） */
export async function getCurrentUser(): Promise<User | undefined> {
  const store = await cookies();
  const id = store.get(AUTH_COOKIE)?.value;
  if (!id) return undefined;
  return getUser(id);
}

/** ログイン必須。未ログインならデフォルトユーザーにフォールバック（デモ用） */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (user) return user;
  const fallback = getUser(DEFAULT_USER_ID);
  if (!fallback) throw new Error("デモユーザーが見つかりません");
  return fallback;
}

/** ロールがメニュー/機能を利用できるか */
export function canAccess(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}

/** ログイン画面で選択可能なデモアカウント */
export function getDemoAccounts(): User[] {
  return getUsers();
}
