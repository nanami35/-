"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

/** Supabase Auth（メール/パスワード）ログインフォーム */
export function SupabaseLoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("メールアドレスまたはパスワードが正しくありません。");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("ログイン処理でエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="space-y-1">
        <label className="text-sm font-medium text-navy-700" htmlFor="email">
          メールアドレス
        </label>
        <input
          id="email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-lg border border-input px-3 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-ring/40"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-navy-700" htmlFor="password">
          パスワード
        </label>
        <input
          id="password" type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-lg border border-input px-3 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-ring/40"
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
}
