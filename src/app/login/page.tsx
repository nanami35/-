import { redirect } from "next/navigation";
import { getCurrentUser, getDemoAccounts } from "@/lib/auth";
import { isSupabaseAuthConfigured } from "@/lib/env";
import { SupabaseLoginForm } from "@/components/auth/supabase-login-form";
import { ROLE_LABELS } from "@/lib/constants";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;
  const supabaseMode = isSupabaseAuthConfigured();
  const accounts = supabaseMode ? [] : await getDemoAccounts();

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-400 text-2xl font-bold text-navy-900">
            M
          </div>
          <h1 className="text-2xl font-bold text-white">飲食店マーケティングOS</h1>
          <p className="mt-1 text-sm text-navy-300">
            飲食店の集客・売上向上を一元管理する社内システム
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-1 text-lg font-semibold text-navy-800">ログイン</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {supabaseMode
              ? "メールアドレスとパスワードでログインしてください。"
              : "デモアカウントを選択してログインしてください。"}
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              ログインに失敗しました。もう一度お試しください。
            </div>
          )}

          {supabaseMode ? (
            <SupabaseLoginForm />
          ) : (
            <form action="/api/login" method="post" className="space-y-2">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  type="submit"
                  name="userId"
                  value={acc.id}
                  className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-navy-400 hover:bg-navy-50"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: acc.avatarColor ?? "#1A2B4A" }}
                  >
                    {acc.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-navy-800">{acc.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {ROLE_LABELS[acc.role]}・{acc.title}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-gold-600">ログイン →</span>
                </button>
              ))}
            </form>
          )}

          {!supabaseMode && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              ※ 本番環境では Supabase Auth によるメール/パスワード認証に置き換わります。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
