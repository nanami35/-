import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolvePublishableKey, requireSupabaseUrl } from "@/lib/supabase";

// =====================================================================
// Cookie 連携の Supabase サーバークライアント(Phase 1.1 手順2 / Supabase Auth)
// ログイン済みユーザーのセッション Cookie を読み書きし、その本人として
// RLS が効いた状態でアクセスする。認証(signInWithPassword/signOut)と
// SupabaseProvider の両方がこのクライアントを使う。
// DATA_SOURCE=supabase のときのみ利用。
// =====================================================================

export async function createServerSupabase(): Promise<SupabaseClient> {
  const jar = await cookies();
  return createServerClient(requireSupabaseUrl(), resolvePublishableKey(), {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          for (const { name, value, options } of list) jar.set(name, value, options);
        } catch {
          // Server Component からの set は不可(middleware/Action 側で更新)。無視して継続。
        }
      },
    },
  });
}
