import Link from "next/link";
import { TrendingUp, Users, Receipt, Repeat, FileText, ListChecks, Target } from "lucide-react";
import { requireClientScope, resolveStore } from "@/lib/portal";
import { getKpiSeries, getReportsByStore, getTasksByStore } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiLineChart } from "@/components/charts/kpi-line-chart";
import { PortalStoreSwitcher } from "@/components/portal/portal-store-switcher";
import { formatCurrency, formatNumber, formatPercent, achievementRate, formatMonth } from "@/lib/utils";

export default async function PortalDashboard({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const sp = await searchParams;
  const { client, stores } = await requireClientScope();
  const store = resolveStore(stores, sp.store);

  if (!store) {
    return (
      <div className="space-y-6">
        <PageHeader title="ダッシュボード" description={client.name} />
        <EmptyState description="店舗情報がまだ登録されていません。担当コンサルタントにお問い合わせください。" />
      </div>
    );
  }

  const [salesSeries, customersSeries, spendSeries, repeatSeries, reports, tasks] =
    await Promise.all([
      getKpiSeries(store.id, "sales"),
      getKpiSeries(store.id, "customers"),
      getKpiSeries(store.id, "avg_spend"),
      getKpiSeries(store.id, "repeat_rate"),
      getReportsByStore(store.id),
      getTasksByStore(store.id),
    ]);

  const last = <T extends { actual: number | null; target: number | null }>(arr: T[]) =>
    arr[arr.length - 1];
  const sales = last(salesSeries);
  const customers = last(customersSeries);
  const spend = last(spendSeries);
  const repeat = last(repeatSeries);
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const latestReport = reports[0];

  const chartData = salesSeries.map((k, i) => ({
    month: k.month.replace("2026-", "") + "月",
    売上: k.actual,
    客数: customersSeries[i]?.actual ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={store.name} description={`${client.name}｜${store.businessType}`}>
        <PortalStoreSwitcher stores={stores.map((s) => ({ id: s.id, name: s.name }))} current={store.id} />
      </PageHeader>

      {/* 目標バナー */}
      {(store.targetGoal || client.goal) && (
        <Card className="border-gold-200 bg-gold-50/50">
          <CardContent className="flex items-center gap-3 pt-5">
            <Target className="h-5 w-5 text-gold-600" />
            <div>
              <p className="text-xs font-medium text-gold-700">達成目標</p>
              <p className="font-semibold text-navy-800">{store.targetGoal ?? client.goal}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI サマリー */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="今月の売上"
          value={formatCurrency(sales?.actual)}
          sub={sales?.target ? `目標達成率 ${formatPercent(achievementRate(sales.actual ?? 0, sales.target) ?? 0, 0)}` : undefined}
          tone="gold"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard label="今月の客数" value={formatNumber(customers?.actual, "人")} icon={<Users className="h-5 w-5" />} />
        <StatCard label="客単価" value={formatCurrency(spend?.actual)} icon={<Receipt className="h-5 w-5" />} />
        <StatCard label="リピート率" value={formatPercent(repeat?.actual, 0)} icon={<Repeat className="h-5 w-5" />} />
      </div>

      {/* 推移グラフ */}
      <Card>
        <CardHeader>
          <CardTitle>売上・客数の推移</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <KpiLineChart
              data={chartData}
              xKey="month"
              series={[
                { dataKey: "売上", name: "売上", color: "#1A2B4A" },
                { dataKey: "客数", name: "客数", color: "#C9A227" },
              ]}
            />
          ) : (
            <EmptyState description="KPIデータがまだありません。" />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 最新レポート */}
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <FileText className="h-5 w-5 text-navy-500" />
            <CardTitle>最新の月次レポート</CardTitle>
          </CardHeader>
          <CardContent>
            {latestReport ? (
              <Link
                href={`/portal/reports/${latestReport.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-navy-50"
              >
                <span className="font-medium text-navy-800">{formatMonth(latestReport.month + "-01")}のレポート</span>
                <Badge tone="navy">開く →</Badge>
              </Link>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">レポートはまだありません。</p>
            )}
          </CardContent>
        </Card>

        {/* タスク */}
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <ListChecks className="h-5 w-5 text-navy-500" />
            <CardTitle>進行中のタスク</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-navy-800">対応中のタスク</span>
              <Badge tone={openTasks > 0 ? "info" : "muted"}>{openTasks}件</Badge>
            </div>
            <Link href="/portal/tasks" className="mt-2 block text-center text-sm font-medium text-gold-600 hover:underline">
              タスク一覧を見る
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
