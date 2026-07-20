import { Plug } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStores } from "@/lib/data";
import { getProviderOverviews } from "@/lib/integrations/ingest";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterSelect } from "@/components/ui/filter-select";
import { IntegrationCard } from "@/components/integrations/integration-card";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const stores = await getStores();
  const storeId = sp.store ?? stores[0]?.id;
  const store = stores.find((s) => s.id === storeId) ?? stores[0];

  if (!store) {
    return (
      <div className="space-y-6">
        <PageHeader title="外部連携" description="各媒体のデータを取り込みます。" />
        <EmptyState description="店舗が登録されていません。" />
      </div>
    );
  }

  const overviews = getProviderOverviews(store);

  return (
    <div className="space-y-6">
      <PageHeader
        title="外部連携"
        description="Google・SNS・広告・POS の数値を取り込み、KPIへ反映します。"
      >
        <FilterSelect
          param="store"
          allLabel={store.name}
          options={stores.map((s) => ({ value: s.id, label: s.name }))}
        />
      </PageHeader>

      {/* 説明 */}
      <Card>
        <CardContent className="flex items-start gap-3 pt-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
            <Plug className="h-5 w-5" />
          </div>
          <div className="text-sm text-navy-700">
            <p className="font-medium">共通アダプタで各媒体を取り込みます（拡張可能）。</p>
            <p className="mt-1 text-muted-foreground">
              取り込んだ数値はそのまま保存されません。<strong>プレビューで確認・編集してからKPIへ反映</strong>します。
              現在は各媒体ともモック取得です。環境変数（各媒体のトークン）を設定すると実API接続へ切り替わります
              （`src/lib/integrations/live-adapters.ts` が実装の拡張点）。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 媒体カード */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overviews.map(({ def, status, live }) => (
          <IntegrationCard
            key={def.provider}
            provider={def.provider}
            label={def.label}
            description={def.description}
            icon={def.icon}
            metricKeys={def.metrics.map((m) => m.kpiKey)}
            status={status}
            live={live}
            storeId={store.id}
          />
        ))}
      </div>
    </div>
  );
}
