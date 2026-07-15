"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession } from "@/lib/auth";
import { audit } from "@/lib/store";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = authenticate(email, password);
  if (!user) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }
  await createSession(user.id);
  audit(user.organizationId, user.id, "auth.login", undefined, undefined, "ログイン成功");
  redirect("/dashboard");
}
