import { Target, TrendingUp, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStores, getStore, getStrategyByStore, getUserName } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterSelect } from "@/components/ui/filter-select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const SALES_BUCKETS = [
  "新規客数を増やす",
  "リピート率を上げる",
  "来店頻度を上げる",
  "注文点数を増やす",
  "商品単価を上げる",
  "高単価商品の比率を上げる",
  "来店可能時間を広げる",
  "稼働率を上げる",
  "回転率を改善する",
] as const;

function splitTactics(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[/、,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function StrategiesPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const stores = await getStores();
  const storeId = sp.store ?? "store_hikari";
  const [store, s] = await Promise.all([getStore(storeId), getStrategyByStore(storeId)]);
  const assigneeName = await getUserName(s?.assigneeId);

  const acquisition = splitTactics(s?.acquisitionTactics);
  const sales = splitTactics(s?.salesTactics);

  return (
    <div className="space-y-6">
      <PageHeader
        title="戦略設計"
        description="店舗の勝ち筋（センターピン）を軸に、集客戦略と売上向上戦略を設計します。"
      >
        <FilterSelect
          param="store"
          options={stores.map((st) => ({ value: st.id, label: st.name }))}
          allLabel="店舗を選択"
        />
      </PageHeader>

      {!s ? (
        <EmptyState
          title="戦略が登録されていません"
          description={`${store?.name ?? "この店舗"} の戦略はまだ設計されていません。`}
        />
      ) : (
        <>
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Target className="h-5 w-5 text-navy-500" />
              <CardTitle>戦略の基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-gold-200 bg-gold-50/60 p-4">
                <p className="text-xs font-semibold text-gold-700">センターピン（最重要の勝ち筋）</p>
                <p className="mt-1 text-sm font-medium text-navy-800">{s.centerPin ?? "—"}</p>
              </div>
              <DataList
                columns={2}
                items={[
                  { label: "目標", value: s.goal, full: true },
                  { label: "戦略テーマ", value: s.theme, full: true },
                  { label: "ターゲット", value: s.target, full: true },
                  { label: "ポジショニング", value: s.positioning, full: true },
                  { label: "選ばれる理由", value: s.reasonChosen, full: true },
                  { label: "重点課題", value: s.keyIssues, full: true },
                  { label: "戦略期間", value: s.period },
                  { label: "予算", value: formatCurrency(s.budget) },
                  { label: "担当者", value: assigneeName },
                ]}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center gap-2">
                <Users className="h-5 w-5 text-navy-500" />
                <CardTitle>集客戦略</CardTitle>
              </CardHeader>
              <CardContent>
                {acquisition.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未設定</p>
                ) : (
                  <ul className="space-y-2">
                    {acquisition.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-800">
                        <span className="mt-0.5 text-gold-500">◆</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center gap-2">
                <TrendingUp className="h-5 w-5 text-navy-500" />
                <CardTitle>売上向上戦略</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 rounded-lg border border-border bg-navy-50/40 p-3 text-sm text-navy-800">
                  <p className="font-medium">売上 = 客数 × 客単価</p>
                  <p className="text-muted-foreground">客数 = 新規 + リピート</p>
                  <p className="text-muted-foreground">客単価 = 購入点数 × 商品単価</p>
                </div>

                {sales.length > 0 && (
                  <ul className="space-y-2">
                    {sales.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-800">
                        <span className="mt-0.5 text-gold-500">◆</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    売上分解の9つの打ち手
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SALES_BUCKETS.map((b) => (
                      <Badge key={b} tone="default">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
