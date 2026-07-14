import { requireUser } from "@/lib/auth";
import {
  getStores,
  getStore,
  getKpiByStore,
  getKpiSeries,
  getKpiMonths,
} from "@/lib/data";
import {
  KPI_CATEGORIES,
  KPI_DEFINITIONS,
  type KpiCategory,
  type KpiDef,
} from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { KpiLineChart } from "@/components/charts/kpi-line-chart";
import { KpiCsvButtons } from "@/components/kpi/csv-buttons";
import {
  achievementRate,
  changeRate,
  formatMonth,
  formatNumber,
  formatPercent,
} from "@/lib/utils";
import { toCsv } from "@/lib/csv";
import type { KpiRecord } from "@/types";

const CATEGORY_TABS = Object.entries(KPI_CATEGORIES).map(([value, label]) => ({
  value,
  label,
}));

/** direction を考慮した達成率（down は 目標/実績、up は 実績/目標） */
function computeAchievement(def: KpiDef, actual: number, target: number): number | null {
  if (def.direction === "down") {
    if (actual === 0) return null;
    return (target / actual) * 100;
  }
  return achievementRate(actual, target);
}

export default async function KpiPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; cat?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;

  const stores = getStores();
  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));
  const storeId = sp.store ?? stores[0]?.id;

  if (!storeId) {
    return (
      <div className="space-y-6">
        <PageHeader title="KPI管理" description="店舗ごとのKPIを管理します。" />
        <EmptyState title="店舗がありません" description="先に店舗を登録してください。" />
      </div>
    );
  }

  const store = getStore(storeId);
  const activeCat = (sp.cat ?? "sales") as KpiCategory;
  const months = getKpiMonths(storeId);

  // チャート用データ（売上・客数）
  const salesSeries = getKpiSeries(storeId, "sales");
  const customerSeries = getKpiSeries(storeId, "customers");
  const salesData = salesSeries.map((r) => ({ month: formatMonth(r.month), sales: r.actual }));
  const customerData = customerSeries.map((r) => ({
    month: formatMonth(r.month),
    customers: r.actual,
  }));

  // 表示対象 KPI 定義
  const defs = KPI_DEFINITIONS.filter((d) => d.category === activeCat);

  // CSV（当該店舗の全 KPI レコード）
  const allRecords: KpiRecord[] = getKpiByStore(storeId);
  const csvRows = allRecords.map((r) => {
    const def = KPI_DEFINITIONS.find((d) => d.key === r.kpiKey);
    return [
      store?.name ?? "",
      r.month,
      KPI_CATEGORIES[r.category],
      def?.label ?? r.kpiKey,
      r.actual,
      r.target,
    ];
  });
  const csv = toCsv(["店舗", "月", "カテゴリ", "KPI", "実績", "目標"], csvRows);

  return (
    <div className="space-y-6">
      <PageHeader title="KPI管理" description="店舗ごとのKPI実績・目標・達成率を管理します。">
        <FilterSelect param="store" options={storeOptions} allLabel="店舗を選択" />
      </PageHeader>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          対象店舗：<span className="font-medium text-navy-800">{store?.name ?? "—"}</span>
        </p>
        <KpiCsvButtons csv={csv} storeName={store?.name ?? "store"} />
      </div>

      {/* 推移チャート */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>売上の推移</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <EmptyState description="売上データがありません。" />
            ) : (
              <KpiLineChart
                data={salesData}
                xKey="month"
                series={[{ dataKey: "sales", name: "売上", color: "#1A2B4A" }]}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>客数の推移</CardTitle>
          </CardHeader>
          <CardContent>
            {customerData.length === 0 ? (
              <EmptyState description="客数データがありません。" />
            ) : (
              <KpiLineChart
                data={customerData}
                xKey="month"
                series={[{ dataKey: "customers", name: "客数", color: "#C9A24B" }]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* カテゴリタブ */}
      <Tabs param="cat" items={CATEGORY_TABS} defaultValue="sales" />

      {/* KPI テーブル */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH className="sticky left-0 bg-navy-50/60">KPI名</TH>
                {months.map((m) => (
                  <TH key={m} className="text-right">
                    {formatMonth(m)}
                  </TH>
                ))}
                <TH className="text-right">目標</TH>
                <TH>達成率</TH>
                <TH className="text-right">前月比</TH>
              </TR>
            </THead>
            <TBody>
              {defs.map((def) => {
                const series = getKpiSeries(storeId, def.key);
                const latest = series[series.length - 1];
                const prev = series[series.length - 2];
                const target = latest?.target ?? null;
                const latestActual = latest?.actual ?? null;

                const achievement =
                  latestActual != null && target != null
                    ? computeAchievement(def, latestActual, target)
                    : null;

                const change =
                  latest?.actual != null && prev?.actual != null
                    ? changeRate(latest.actual, prev.actual)
                    : null;

                return (
                  <TR key={def.key}>
                    <TD className="sticky left-0 bg-card font-medium text-navy-800">
                      {def.label}
                      <span className="ml-1 text-xs text-muted-foreground">({def.unit})</span>
                    </TD>
                    {months.map((m) => {
                      const rec = series.find((r) => r.month === m);
                      return (
                        <TD key={m} className="text-right text-sm">
                          {rec && rec.actual != null
                            ? formatNumber(rec.actual)
                            : "—"}
                        </TD>
                      );
                    })}
                    <TD className="text-right text-sm">{formatNumber(target)}</TD>
                    <TD>
                      {achievement == null ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={achievement}
                            tone={
                              achievement >= 100
                                ? "success"
                                : achievement >= 80
                                  ? "gold"
                                  : "warning"
                            }
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">
                            {formatPercent(achievement, 0)}
                          </span>
                        </div>
                      )}
                    </TD>
                    <TD className="text-right text-sm">
                      {change == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className={change >= 0 ? "text-success" : "text-danger"}>
                          {change >= 0 ? "+" : ""}
                          {formatPercent(change, 1)}
                        </span>
                      )}
                    </TD>
                  </TR>
                );
              })}
              {defs.length === 0 && (
                <TR>
                  <TD colSpan={months.length + 3}>
                    <EmptyState description="このカテゴリのKPIはありません。" />
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
