import { Map as MapIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStores, getStore, getMarketByStore } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterSelect } from "@/components/ui/filter-select";
import { Badge } from "@/components/ui/badge";

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const stores = await getStores();
  const storeId = sp.store ?? "store_hikari";
  const [store, m] = await Promise.all([getStore(storeId), getMarketByStore(storeId)]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="市場・商圏分析"
        description="対象エリアの市場環境と商圏特性を整理し、戦略立案の前提を可視化します。"
      >
        <FilterSelect
          param="store"
          options={stores.map((s) => ({ value: s.id, label: s.name }))}
          allLabel="店舗を選択"
        />
      </PageHeader>

      {!store ? (
        <EmptyState title="店舗が見つかりません" description="有効な店舗を選択してください。" />
      ) : !m ? (
        <EmptyState
          title="市場分析データがありません"
          description={`${store.name} の市場分析はまだ登録されていません。`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <MapIcon className="h-5 w-5 text-navy-500" />
              <CardTitle>市場分析</CardTitle>
            </CardHeader>
            <CardContent>
              <DataList
                columns={1}
                items={[
                  { label: "市場規模", value: m.marketSize },
                  { label: "市場成長性", value: m.marketGrowth },
                  { label: "市場トレンド", value: m.trends },
                  { label: "顧客ニーズ", value: m.customerNeeds },
                  { label: "市場の機会", value: m.opportunities },
                  { label: "市場の脅威", value: m.threats },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <CardTitle>商圏分析</CardTitle>
              <Badge tone="muted">Phase 2 拡充予定</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataList
                columns={1}
                items={[
                  { label: "商圏", value: store.tradeArea },
                  { label: "主要顧客層", value: store.mainCustomerSegment },
                ]}
              />
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <CardDescription>
                  商圏データ（周辺人口 / 昼間・夜間人口 / 年齢構成 / 周辺施設 / 通行量 等）は
                  Phase 2 で拡充予定です。上記は現時点で利用可能な参考情報です。
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
