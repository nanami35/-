"use client";

import * as React from "react";
import { Sparkles, Pencil, Check, X, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { REPORT_SECTIONS } from "@/lib/constants";
import { parseReportSections } from "@/lib/ai/report-sections";

interface ReportSectionsEditorProps {
  storeId: string;
  month: string;
  initialSections: Record<string, string>;
}

export function ReportSectionsEditor({ storeId, month, initialSections }: ReportSectionsEditorProps) {
  const [sections, setSections] = React.useState<Record<string, string>>(initialSections);
  const [editMode, setEditMode] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [aiDraft, setAiDraft] = React.useState<Record<string, string> | null>(null);
  const [aiMeta, setAiMeta] = React.useState<{ provider: string; model: string } | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setAiDraft(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "report_draft", storeId, month }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました。");
      const parsed = parseReportSections(data.content as string);
      if (Object.keys(parsed).length === 0) {
        throw new Error("下書きの解析に失敗しました。もう一度お試しください。");
      }
      setAiDraft(parsed);
      setAiMeta({ provider: data.provider, model: data.model });
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function reflectDraft() {
    if (!aiDraft) return;
    setSections((prev) => {
      const next = { ...prev };
      for (const title of REPORT_SECTIONS) {
        if (aiDraft[title]) next[title] = aiDraft[title]!;
      }
      return next;
    });
    setAiDraft(null);
    setSaved(false);
  }

  return (
    <div className="space-y-4">
      {/* 編集ツールバー */}
      <div className="flex flex-wrap items-center gap-2">
        {!editMode ? (
          <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
            <Pencil className="h-4 w-4" /> 編集する
          </Button>
        ) : (
          <>
            <Button variant="gold" size="sm" onClick={generate} disabled={loading}>
              <Sparkles className="h-4 w-4" />
              {loading ? "生成中..." : "AIで下書き生成"}
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setSaved(true); setEditMode(false); }}>
              <Check className="h-4 w-4" /> 承認して保存
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSections(initialSections); setEditMode(false); setAiDraft(null); }}>
              取消
            </Button>
            <span className="text-xs text-muted-foreground">※ 本デモでは保存されません</span>
          </>
        )}
        {saved && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-sm text-green-700">
            <Check className="h-4 w-4" /> 承認しました
          </span>
        )}
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {/* AI下書きの反映確認 */}
      {aiDraft && (
        <Card className="border-gold-300 bg-gold-50/40">
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-start gap-2 text-sm text-gold-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                AI（{aiMeta?.provider === "anthropic" ? aiMeta.model : "モック"}）が下書きを作成しました。
                内容を確認し、各項目へ反映してください。反映後も自由に編集できます。
                <strong>そのまま保存せず、必ず担当者が確認・編集してください。</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="gold" onClick={reflectDraft}>
                <Check className="h-4 w-4" /> 各項目に反映する
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAiDraft(null)}>
                <X className="h-4 w-4" /> 破棄
              </Button>
              <Button size="sm" variant="ghost" onClick={generate} disabled={loading}>
                <RefreshCw className="h-4 w-4" /> 再生成
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 12セクション */}
      {REPORT_SECTIONS.map((section, i) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle>{i + 1}. {section}</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <textarea
                value={sections[section] ?? ""}
                onChange={(e) => { setSections((p) => ({ ...p, [section]: e.target.value })); setSaved(false); }}
                rows={4}
                className="w-full rounded-lg border border-input p-3 text-sm leading-relaxed outline-none focus:border-navy-400 focus:ring-2 focus:ring-ring/40"
                placeholder="（未記入）"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-800">
                {sections[section] || "—"}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
