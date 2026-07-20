"use client";

import * as React from "react";
import { X, RefreshCw, Check, AlertTriangle, Star, Cable } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavIcon } from "@/components/layout/nav-icon";
import { KPI_DEFINITIONS } from "@/lib/constants";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { ConnectionStatus, IntegrationProvider } from "@/lib/integrations/types";

interface SyncResult {
  provider: string;
  mode: "mock" | "live";
  mappedKpi: { kpiKey: string; label: string; unit: string; value: number }[];
  reviews?: { author: string; rating: number; text: string; date: string }[];
  warnings: string[];
}

interface IntegrationCardProps {
  provider: IntegrationProvider;
  label: string;
  description: string;
  icon: string;
  metricKeys: string[];
  status: ConnectionStatus;
  live: boolean;
  storeId: string;
}

function fmt(value: number, unit: string): string {
  if (unit === "円") return formatCurrency(value);
  return formatNumber(value, unit);
}

export function IntegrationCard({
  provider, label, description, icon, metricKeys, status, live, storeId,
}: IntegrationCardProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<SyncResult | null>(null);
  const [applied, setApplied] = React.useState(false);

  const kpiLabels = metricKeys
    .map((k) => KPI_DEFINITIONS.find((d) => d.key === k)?.label ?? k)
    .slice(0, 6);

  async function sync() {
    setOpen(true);
    setLoading(true);
    setError(null);
    setResult(null);
    setApplied(false);
    try {
      const res = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, storeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "同期に失敗しました。");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "同期に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardContent className="flex flex-1 flex-col gap-3 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
              <NavIcon name={icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-navy-800">{label}</h3>
                <Badge tone={status === "connected" ? "success" : "muted"}>
                  {status === "connected" ? "連携中" : "未接続"}
                </Badge>
                <Badge tone={live ? "navy" : "muted"}>{live ? "実接続" : "モック"}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            取り込むKPI: {kpiLabels.join(" / ")}
            {metricKeys.length > kpiLabels.length ? " ほか" : ""}
          </div>

          <div className="mt-auto">
            <Button variant="outline" size="sm" onClick={sync} className="gap-1.5">
              <RefreshCw className="h-4 w-4" /> データを取り込む
            </Button>
          </div>
        </CardContent>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-navy-800 px-5 py-3 text-white">
              <div className="flex items-center gap-2">
                <Cable className="h-5 w-5 text-gold-400" />
                <span className="font-semibold">{label} の取り込みプレビュー</span>
                {result && (
                  <Badge tone={result.mode === "live" ? "success" : "muted"}>
                    {result.mode === "live" ? "実データ" : "モック"}
                  </Badge>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-navy-700" aria-label="閉じる">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loading && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin text-navy-500" />
                  <p className="text-sm">データを取得しています...</p>
                </div>
              )}
              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

              {result && !loading && (
                <div className="space-y-4">
                  {result.warnings.length > 0 && (
                    <div className="space-y-1 rounded-lg bg-gold-50 px-3 py-2 text-xs text-gold-700">
                      {result.warnings.map((w, i) => (
                        <p key={i} className="flex gap-1.5">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}
                        </p>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-sm font-medium text-navy-700">KPIへの反映候補</p>
                    <div className="overflow-hidden rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-border">
                          {result.mappedKpi.map((m) => (
                            <tr key={m.kpiKey} className="hover:bg-navy-50/40">
                              <td className="px-3 py-2 text-navy-700">{m.label}</td>
                              <td className="px-3 py-2 text-right font-medium text-navy-800">
                                {fmt(m.value, m.unit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {result.reviews && result.reviews.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-navy-700">取得した口コミ（{result.reviews.length}件）</p>
                      <div className="space-y-2">
                        {result.reviews.map((r, i) => (
                          <div key={i} className="rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-navy-800">{r.author}</span>
                              <span className="flex items-center gap-0.5 text-gold-500">
                                {Array.from({ length: r.rating }).map((_, j) => (
                                  <Star key={j} className="h-3.5 w-3.5 fill-current" />
                                ))}
                              </span>
                              <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                            </div>
                            <p className="mt-1 text-sm text-navy-700">{r.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {applied && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                      <Check className="h-4 w-4" /> KPIに反映しました。（デモのため保存はされません）
                    </div>
                  )}
                </div>
              )}
            </div>

            {result && !loading && (
              <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                <Button variant="ghost" onClick={sync} className="gap-1.5">
                  <RefreshCw className="h-4 w-4" /> 再取得
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>閉じる</Button>
                <Button variant="primary" onClick={() => setApplied(true)} className="gap-1.5">
                  <Check className="h-4 w-4" /> KPIに反映（確認）
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
