import { requireClientScope, resolveStore } from "@/lib/portal";
import { getKpiByStore, getKpiMonths } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PortalStoreSwitcher } from "@/components/portal/portal-store-switcher";
import { KPI_DEFINITIONS } from "@/lib/constants";
import { formatNumber, formatCurrency } from "@/lib/utils";

// クライアントが自身で入力・確認する主要KPI
const CLIENT_KPI_KEYS = ["sales", "customers", "avg_spend", "new_customers", "repeat_rate", "reservations"];

export default async function PortalKpiPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const sp = await searchParams;
  const { stores } = await requireClientScope();
  const store = resolveStore(stores, sp.store);
  if (!store) return <EmptyState description="店舗がありません。" />;

  const [records, months] = await Promise.all([
    getKpiByStore(store.id),
    getKpiMonths(store.id),
  ]);
  const recent = months.slice(-6);
  const value = (key: string, month: string) =>
    records.find((r) => r.kpiKey === key && r.month === month)?.actual ?? null;

  return (
    <div className="space-y-6">
      <PageHeader title="売上・KPI" description={`${store.name} の数値を確認・入力できます。`}>
        <PortalStoreSwitcher stores={stores.map((s) => ({ id: s.id, name: s.name }))} current={store.id} />
      </PageHeader>

      {/* 数値入力（デモ：視覚のみ） */}
      <Card>
        <CardHeader>
          <CardTitle>今月の数値を入力</CardTitle>
          <CardDescription>売上・客数などを入力し送信すると、担当コンサルタントに共有されます。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "売上（円）", ph: "3,100,000" },
              { label: "客数（人）", ph: "1,540" },
              { label: "客単価（円）", ph: "2,013" },
              { label: "新規客数（人）", ph: "640" },
              { label: "予約数（件）", ph: "—" },
              { label: "リピート率（%）", ph: "25" },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <input
                  className="h-10 w-full rounded-lg border border-input px-3 text-sm outline-none focus:border-navy-400"
                  placeholder={f.ph}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="gold">この内容で送信</Button>
            <span className="text-xs text-muted-foreground">※ 本デモでは保存されません。</span>
          </div>
        </CardContent>
      </Card>

      {/* KPI 実績 */}
      <Card>
        <CardHeader>
          <CardTitle>KPI実績（直近6ヶ月）</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState description="KPIデータがまだありません。" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>KPI</TH>
                  {recent.map((m) => (
                    <TH key={m} className="text-right">{m.replace("2026-", "") + "月"}</TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {CLIENT_KPI_KEYS.map((key) => {
                  const def = KPI_DEFINITIONS.find((d) => d.key === key);
                  if (!def) return null;
                  return (
                    <TR key={key}>
                      <TD className="font-medium text-navy-800">{def.label}</TD>
                      {recent.map((m) => {
                        const v = value(key, m);
                        return (
                          <TD key={m} className="text-right">
                            {v == null ? "—" : def.unit === "円" ? formatCurrency(v) : formatNumber(v, def.unit)}
                          </TD>
                        );
                      })}
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
