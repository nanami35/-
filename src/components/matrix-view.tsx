"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SCORE_SYMBOL } from "@/lib/labels";
import type { ComparisonMatrix, ScoreSymbol } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Download, FileText, Printer, Presentation } from "lucide-react";
import { cn } from "@/lib/cn";

const SYMBOL_TONE: Record<ScoreSymbol, string> = {
  double_circle: "text-success font-bold",
  circle: "text-navy",
  triangle: "text-warning",
  cross: "text-danger",
  "n/a": "text-muted text-xs",
  unknown: "text-muted text-xs",
};

export function MatrixView({
  matrix,
  targetLabels,
}: {
  matrix: ComparisonMatrix;
  targetLabels: Record<string, string>;
}) {
  const { toast } = useToast();
  const [hiddenTargets, setHiddenTargets] = useState<Set<string>>(new Set());
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const scoreMap = useMemo(() => {
    const map = new Map<string, { symbol: ScoreSymbol; note?: string; source?: string }>();
    matrix.scores.forEach((s) => map.set(`${s.targetId}|${s.itemId}`, s));
    return map;
  }, [matrix.scores]);

  const targets = matrix.targetIds.filter((t) => !hiddenTargets.has(t));
  const items = matrix.items.filter((i) => !hiddenItems.has(i.id));

  const cellText = (targetId: string, itemId: string) => {
    const s = scoreMap.get(`${targetId}|${itemId}`);
    if (!s) return "";
    if (s.symbol === "n/a") return s.note ?? "対象外";
    return SCORE_SYMBOL[s.symbol];
  };

  function exportCsv() {
    const header = ["比較項目", ...targets.map((t) => targetLabels[t] ?? t)];
    const rows = items.map((item) => [
      item.label,
      ...targets.map((t) => cellText(t, item.id)),
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadBlob("﻿" + csv, `${matrix.name}.csv`, "text/csv");
    toast("CSVをエクスポートしました");
  }

  function exportSalesText() {
    const lines: string[] = [`■ ${matrix.name}`, ""];
    items.forEach((item) => {
      lines.push(`【${item.label}】`);
      targets.forEach((t) => {
        const s = scoreMap.get(`${t}|${item.id}`);
        if (s) lines.push(`  ・${targetLabels[t] ?? t}: ${s.symbol === "n/a" ? s.note : SCORE_SYMBOL[s.symbol]}${s.note && s.symbol !== "n/a" ? `(${s.note})` : ""}`);
      });
      lines.push("");
    });
    downloadBlob(lines.join("\n"), `${matrix.name}_営業説明.txt`, "text/plain");
    toast("営業説明用テキストを出力しました");
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
        <Button size="sm" variant="secondary" onClick={exportCsv}>
          <Download className="h-4 w-4" /> CSV
        </Button>
        <Button size="sm" variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> 印刷 / PDF
        </Button>
        <Button size="sm" variant="secondary" onClick={exportSalesText}>
          <FileText className="h-4 w-4" /> 営業説明テキスト
        </Button>
        <Button size="sm" variant="secondary" onClick={exportSalesText}>
          <Presentation className="h-4 w-4" /> プレゼン用テキスト
        </Button>
      </div>

      {/* 凡例 */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted print:mb-2">
        <span><span className="font-bold text-success">◎</span> 中核</span>
        <span><span className="text-navy">○</span> 担う</span>
        <span><span className="text-warning">△</span> 限定的</span>
        <span><span className="text-danger">×</span> 担わない</span>
        <span>対象外 / 不明</span>
      </div>

      {/* 列の表示切替 */}
      <div className="mb-3 flex flex-wrap gap-1.5 print:hidden">
        {matrix.targetIds.map((t) => (
          <button
            key={t}
            onClick={() =>
              setHiddenTargets((prev) => {
                const next = new Set(prev);
                next.has(t) ? next.delete(t) : next.add(t);
                return next;
              })
            }
          >
            <Badge tone={hiddenTargets.has(t) ? "gray" : "navy"}>{targetLabels[t] ?? t}</Badge>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-navy-100/60 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-navy-700 text-white">
              <th className="sticky left-0 z-10 min-w-[10rem] bg-navy-700 px-3 py-2.5 text-left font-medium">
                比較項目
              </th>
              {targets.map((t) => (
                <th key={t} className="min-w-[7rem] px-3 py-2.5 text-center font-medium">
                  {targetLabels[t] ?? t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, ri) => (
              <tr key={item.id} className={cn(ri % 2 ? "bg-canvas/60" : "bg-white")}>
                <td className="sticky left-0 z-10 border-r border-navy-100/50 bg-inherit px-3 py-2 font-medium text-navy">
                  {item.label}
                </td>
                {targets.map((t) => {
                  const s = scoreMap.get(`${t}|${item.id}`);
                  return (
                    <td
                      key={t}
                      title={s ? `${s.note ?? ""}${s.source ? `｜出典: ${s.source}` : ""}` : ""}
                      className={cn(
                        "px-3 py-2 text-center",
                        s ? SYMBOL_TONE[s.symbol] : "text-muted",
                      )}
                    >
                      {cellText(t, item.id)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        ※ 各セルにカーソルを合わせると根拠と出典が表示されます。ABENGERS/コエニは指示書の定義、その他は業界研究に基づく仮説(要確認)です。
      </p>
    </div>
  );
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
