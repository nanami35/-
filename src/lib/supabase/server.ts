/**
 * サーバー用 Supabase クライアント（Cookie ベースのセッション）。
 * サーバーコンポーネント / Route Handler から利用する。
 * Supabase 未設定時は null を返す。
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseAuthConfigured } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!isSupabaseAuthConfigured()) return null;

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの set はミドルウェアで処理されるため無視可能
          }
        },
      },
    }
  );
}
