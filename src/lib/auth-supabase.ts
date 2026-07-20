import "server-only";
import type { SafeUser, Role } from "@/lib/types";
import { createServerSupabase } from "@/lib/supabase-server";

// =====================================================================
// Supabase Auth 連携(DATA_SOURCE=supabase / Phase 1.1 手順2)
// ログイン済みユーザーを user_profiles と結合して SafeUser を構築する。
// seed モードでは使用しない(auth.ts が分岐)。
// =====================================================================

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  organization_id: string;
  role: Role;
  title?: string | null;
  is_executive?: boolean | null;
  is_manager?: boolean | null;
  created_at?: string | null;
}

export async function getSupabaseUser(): Promise<SafeUser | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    organizationId: profile.organization_id,
    role: profile.role,
    title: profile.title ?? undefined,
    isExecutive: profile.is_executive ?? false,
    isManager: profile.is_manager ?? false,
    createdAt: profile.created_at ?? "",
  };
}

export async function supabaseSignIn(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "メールアドレスまたはパスワードが正しくありません。" };
  return {};
}

export async function supabaseSignOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
}
