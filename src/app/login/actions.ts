"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession } from "@/lib/auth";
import { isSupabaseMode } from "@/lib/supabase";
import { audit } from "@/lib/store";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  // supabase モード: Supabase Auth でサインイン(セッション Cookie は SDK が設定)。
  if (isSupabaseMode()) {
    const { supabaseSignIn } = await import("@/lib/auth-supabase");
    const { error } = await supabaseSignIn(email, password);
    if (error) return { error };
    redirect("/dashboard");
  }

  // seed モード: 署名付き Cookie セッション。
  const user = authenticate(email, password);
  if (!user) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }
  await createSession(user.id);
  audit(user.organizationId, user.id, "auth.login", undefined, undefined, "ログイン成功");
  redirect("/dashboard");
}
