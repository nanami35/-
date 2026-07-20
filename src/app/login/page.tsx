"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-700 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-panel md:grid md:grid-cols-2">
        {/* ブランド面 */}
        <div className="hidden flex-col justify-between bg-navy-700 p-8 text-white md:flex">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gold font-bold text-navy-800">
              A
            </div>
            <span className="font-semibold">ABENGERS KNOWLEDGE OS</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-snug">
              価値ある事業を創造・成長させる
              <br />
              社内経営ナレッジ基盤
            </h1>
            <p className="mt-3 text-sm text-navy-100/80">
              外部情報と社内ナレッジを一元管理し、検索・比較・AI相談できる状態をつくる、ABENGERSの「社内経営OS」。
            </p>
          </div>
          <p className="text-xs text-navy-100/50">© ABENGERS / コエニ / SEEDグループ</p>
        </div>

        {/* ログインフォーム */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-navy">ログイン</h2>
          <p className="mt-1 text-sm text-muted">アカウント情報を入力してください。</p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <Label>メールアドレス</Label>
              <Input name="email" type="email" required placeholder="you@example.com" autoComplete="username" />
            </div>
            <div>
              <Label>パスワード</Label>
              <Input name="password" type="password" required placeholder="••••••••" autoComplete="current-password" />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger ring-1 ring-inset ring-red-200">
                <AlertTriangle className="h-4 w-4" />
                {state.error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "認証中…" : "ログイン"}
            </Button>
          </form>

          <p className="mt-6 text-[11px] text-muted">
            アクセス権限が必要な場合は管理者にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}
