import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getInitiative, getStore, getUserName } from "@/lib/data";
import { KPI_DEFINITIONS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataList, type DataListItem } from "@/components/ui/data-list";
import { InitiativeStatusBadge } from "@/components/status-badge";
import { achievementRate, formatCurrency, formatDate, formatNumber } from "@/lib/utils";

function kpiLabel(key?: string): string {
  if (!key) return "—";
  return KPI_DEFINITIONS.find((d) => d.key === key)?.label ?? key;
}

export default async function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const initiative = getInitiative(id);
  if (!initiative) notFound();

  const store = getStore(initiative.storeId);
  const progress =
    initiative.actualValue != null && initiative.targetValue != null
      ? achievementRate(initiative.actualValue, initiative.targetValue) ?? 0
      : 0;

  const details: DataListItem[] = [
    { label: "目的", value: initiative.purpose },
    { label: "対象顧客", value: initiative.targetCustomer },
    { label: "仮説", value: initiative.hypothesis, full: true },
    { label: "実施内容", value: initiative.content, full: true },
    { label: "チャネル", value: initiative.channel },
    { label: "開始日", value: formatDate(initiative.startDate) },
    { label: "終了日", value: formatDate(initiative.endDate) },
    { label: "予算", value: formatCurrency(initiative.budget) },
    { label: "担当者", value: getUserName(initiative.assigneeId) },
    { label: "KPI", value: kpiLabel(initiative.kpiKey) },
    { label: "目標値", value: formatNumber(initiative.targetValue) },
    { label: "実績値", value: formatNumber(initiative.actualValue) },
    { label: "進捗率", value: `${Math.round(progress)}%` },
  ];

  const retrospective: { label: string; value?: string }[] = [
    { label: "結果", value: initiative.result },
    { label: "良かった点", value: initiative.goodPoints },
    { label: "改善点", value: initiative.improvements },
    { label: "次回アクション", value: initiative.nextAction },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/initiatives"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy-700"
        >
          <ArrowLeft className="h-4 w-4" />
          施策一覧に戻る
        </Link>
        <PageHeader title={initiative.name}>
          <InitiativeStatusBadge value={initiative.status} />
          <Badge tone="navy">{initiative.category}</Badge>
        </PageHeader>
        {store && (
          <p className="text-sm text-muted-foreground">
            店舗：
            <Link
              href={`/stores/${store.id}`}
              className="text-navy-600 hover:text-gold-600 hover:underline"
            >
              {store.name}
            </Link>
          </p>
        )}
      </div>

      {/* 進捗 */}
      <Card>
        <CardHeader>
          <CardTitle>目標達成状況</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <Progress
              value={progress}
              tone={progress >= 100 ? "success" : progress >= 60 ? "gold" : "warning"}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-navy-800">
              {Math.round(progress)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            実績 {formatNumber(initiative.actualValue)} / 目標{" "}
            {formatNumber(initiative.targetValue)}（{kpiLabel(initiative.kpiKey)}）
          </p>
        </CardContent>
      </Card>

      {/* 施策詳細 */}
      <Card>
        <CardHeader>
          <CardTitle>施策詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <DataList items={details} columns={2} />
        </CardContent>
      </Card>

      {/* 振り返り */}
      <Card>
        <CardHeader>
          <CardTitle>振り返り</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {retrospective.map((r) => (
            <div key={r.label}>
              <p className="text-xs font-medium text-muted-foreground">{r.label}</p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-navy-800">
                {r.value && r.value.trim() !== "" ? (
                  r.value
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
