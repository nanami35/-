import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown, Link2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReport, getStore, getKpiByStore } from "@/lib/data";
import { REPORT_SECTIONS, KPI_DEFINITIONS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/status-badge";
import { PrintButton } from "@/components/reports/print-button";
import { AiDraftButton } from "@/components/ai/ai-draft-button";
import { formatMonth, formatNumber, formatPercent, achievementRate } from "@/lib/utils";

/** KPIサマリーに表示する主要KPI */
const SUMMARY_KPI_KEYS = [
  "sales",
  "customers",
  "avg_spend",
  "repeat_rate",
  "ig_followers",
  "review_count",
];

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const report = await getReport(id);
  if (!report) notFound();

  const store = await getStore(report.storeId);
  const kpis = (await getKpiByStore(report.storeId)).filter(
    (k) => k.month === report.month
  );

  const summaryKpis = SUMMARY_KPI_KEYS.map((key) => {
    const def = KPI_DEFINITIONS.find((d) => d.key === key);
    const record = kpis.find((k) => k.kpiKey === key);
    return { key, def, record };
  }).filter((s) => s.def);

  return (
    <div className="space-y-6">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy-700"
      >
        <ArrowLeft className="h-4 w-4" />
        月次レポート一覧へ戻る
      </Link>

      <PageHeader title={store?.name ?? "月次レポート"}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="navy">{formatMonth(`${report.month}-01`)}</Badge>
          <ReportStatusBadge value={report.status} />
        </div>
      </PageHeader>

      {/* ツールバー（操作ボタン） */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <PrintButton />
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4" />
            PDF出力
          </Button>
          <Button variant="outline" size="sm">
            <Link2 className="h-4 w-4" />
            共有URL発行
          </Button>
          <div className="flex flex-col gap-1 sm:ml-auto sm:items-end">
            <AiDraftButton
              task="report_draft"
              storeId={report.storeId}
              month={report.month}
              label="AIでレポート下書き生成"
              size="sm"
            />
            <p className="max-w-xs text-[11px] text-muted-foreground">
              AIが生成した下書きは必ず担当者が編集・承認してから保存します。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPIサマリー */}
      <Card>
        <CardHeader>
          <CardTitle>KPIサマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {summaryKpis.map(({ key, def, record }) => {
              const rate =
                record && record.actual != null && record.target != null
                  ? achievementRate(record.actual, record.target)
                  : null;
              return (
                <div key={key} className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">{def?.label}</p>
                  <p className="mt-1 text-lg font-bold text-navy-800">
                    {formatNumber(record?.actual, def?.unit ?? "")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    達成率 {rate != null ? formatPercent(rate, 0) : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* レポート本文（12セクション） */}
      <div className="space-y-4">
        {REPORT_SECTIONS.map((title, index) => {
          const body = report.sections[title];
          return (
            <Card key={title}>
              <CardHeader>
                <CardTitle>
                  <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-navy-800">
                  {body && body.trim() !== "" ? body : "—"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
