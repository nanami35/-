import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { SafeUser, User } from "@/lib/types";
import { db } from "@/lib/store";
import { isSupabaseMode } from "@/lib/supabase";

// =====================================================================
// 認証(要件 8-1)
// MVP: 署名付きCookieによるセッション。パスワードはシードの平文で照合。
// 本番: Supabase Auth に差し替え(同じ getCurrentUser() インターフェイス)。
// =====================================================================

const COOKIE = "abengers_session";
const SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32chars";

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${mac}`;
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export function toSafeUser(u: User): SafeUser {
  const { password: _pw, ...safe } = u;
  return safe;
}

export function authenticate(email: string, password: string): SafeUser | null {
  const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase().trim());
  if (!u || u.password !== password) return null;
  return toSafeUser(u);
}

export async function createSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  // supabase モードは Supabase Auth のセッションから解決する。
  if (isSupabaseMode()) {
    const { getSupabaseUser } = await import("@/lib/auth-supabase");
    return getSupabaseUser();
  }
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const userId = verify(raw);
  if (!userId) return null;
  const u = db.users.find((x) => x.id === userId);
  return u ? toSafeUser(u) : null;
}

/** ログイン必須ページ用。未ログインなら null を返す(呼び出し側でredirect)。 */
export async function requireUser(): Promise<SafeUser | null> {
  return getCurrentUser();
}
