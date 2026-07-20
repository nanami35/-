"use client";

import * as React from "react";
import { Sparkles, X, RefreshCw, Check, AlertTriangle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AiTaskType } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface AiDraftButtonProps {
  task: AiTaskType;
  storeId?: string;
  month?: string;
  label?: string;
  freeInputLabel?: string;
  size?: "sm" | "md";
  variant?: "gold" | "outline";
}

interface DraftResponse {
  content: string;
  provider: string;
  model: string;
  disclaimer: string;
}

export function AiDraftButton({
  task, storeId, month, label = "AIで下書き生成", freeInputLabel, size = "md", variant = "gold",
}: AiDraftButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<DraftResponse | null>(null);
  const [text, setText] = React.useState("");
  const [freeInput, setFreeInput] = React.useState("");
  const [approved, setApproved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setApproved(false);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, storeId, month, freeInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました。");
      setDraft(data);
      setText(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function openPanel() {
    setOpen(true);
    setDraft(null);
    setText("");
    setError(null);
    setApproved(false);
    if (!freeInputLabel) void generate();
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={openPanel}
        className="gap-1.5"
      >
        <Sparkles className="h-4 w-4" />
        {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* ヘッダー */}
            <div className="flex items-center justify-between border-b border-border bg-navy-800 px-5 py-3 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-400" />
                <span className="font-semibold">{label}</span>
                {draft && (
                  <Badge tone={draft.provider === "anthropic" ? "success" : "muted"}>
                    {draft.provider === "anthropic" ? `AI: ${draft.model}` : "モック"}
                  </Badge>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-navy-700" aria-label="閉じる">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* 注意書き（常に表示） */}
              <div className="mb-4 flex gap-2 rounded-lg bg-gold-50 px-3 py-2 text-xs text-gold-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  AIが生成した内容は<strong>下書き</strong>です。数値・事実を必ず確認し、編集・承認してからご利用ください。
                  （本デモでは承認しても永続保存は行いません）
                </p>
              </div>

              {/* 自由入力 */}
              {freeInputLabel && !draft && (
                <div className="mb-4 space-y-1">
                  <label className="text-sm font-medium text-navy-700">{freeInputLabel}</label>
                  <textarea
                    value={freeInput}
                    onChange={(e) => setFreeInput(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-input p-2 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-ring/40"
                    placeholder="ここに入力してください..."
                  />
                  <Button onClick={generate} disabled={loading} className="mt-1">
                    {loading ? "生成中..." : "生成する"}
                  </Button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin text-navy-500" />
                  <p className="text-sm">AIが下書きを作成しています...</p>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              {draft && !loading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-navy-700">下書き（編集可能）</label>
                    <button onClick={copyText} className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-700">
                      <Copy className="h-3.5 w-3.5" /> {copied ? "コピー済み" : "コピー"}
                    </button>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => { setText(e.target.value); setApproved(false); }}
                    rows={16}
                    className="w-full rounded-lg border border-input p-3 font-mono text-xs leading-relaxed outline-none focus:border-navy-400 focus:ring-2 focus:ring-ring/40"
                  />
                  {approved && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                      <Check className="h-4 w-4" />
                      内容を承認しました。（デモのため保存はされません。コピーしてご利用ください）
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* フッター */}
            {draft && !loading && (
              <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                <Button variant="ghost" onClick={generate} className="gap-1.5">
                  <RefreshCw className="h-4 w-4" /> 再生成
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>破棄</Button>
                <Button variant="primary" onClick={() => setApproved(true)} className={cn("gap-1.5", approved && "opacity-70")}>
                  <Check className="h-4 w-4" /> 承認して反映
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
