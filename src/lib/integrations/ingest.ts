/**
 * データ取り込み（受け皿）。
 * アダプタで外部媒体から取得 → KPI へ正規化マッピングして SyncResult を返す。
 * ここでは「保存はしない」。UI でプレビューし、人が確認してから反映する。
 */
import { getStore } from "@/lib/data";
import { getIntegrationDef, INTEGRATION_DEFS } from "@/lib/integrations/definitions";
import { getAdapter, getConnectionStatus, isProviderLive } from "@/lib/integrations/registry";
import { KPI_DEFINITIONS } from "@/lib/constants";
import type { SyncResult, ConnectionStatus, IntegrationDefinition } from "@/lib/integrations/types";
import type { Store } from "@/types";

const CURRENT_MONTH = "2026-07";

/** 指定プロバイダ×店舗×月を同期し、KPI反映候補をプレビューとして返す（保存なし） */
export async function syncProvider(
  provider: string,
  storeId: string,
  month: string = CURRENT_MONTH
): Promise<SyncResult> {
  const def = getIntegrationDef(provider);
  if (!def) throw new Error("未知の連携プロバイダです。");
  const store = await getStore(storeId);
  if (!store) throw new Error("店舗が見つかりません。");

  const adapter = getAdapter(provider);
  const live = adapter.isLive();

  const snapshot = await adapter.fetchMetrics({ store, month });
  const reviews = adapter.fetchReviews ? await adapter.fetchReviews({ store, month }) : undefined;

  const mappedKpi = snapshot.metrics.map((m) => {
    const kpiDef = KPI_DEFINITIONS.find((d) => d.key === m.kpiKey);
    return {
      kpiKey: m.kpiKey,
      label: kpiDef?.label ?? m.kpiKey,
      unit: kpiDef?.unit ?? "",
      value: m.value,
    };
  });

  const warnings: string[] = [];
  if (!live) warnings.push("これはデモのモックデータです（外部APIには接続していません）。");
  if (def.storeUrlField && !store[def.storeUrlField]) {
    warnings.push(`この店舗には ${def.label} のURL/アカウントが未登録です。`);
  }

  return {
    provider: def.provider,
    storeId,
    month,
    mode: live ? "live" : "mock",
    fetchedAt: new Date().toISOString(),
    mappedKpi,
    reviews,
    warnings,
  };
}

export interface ProviderOverview {
  def: IntegrationDefinition;
  status: ConnectionStatus;
  live: boolean;
}

/** 店舗の全プロバイダ接続状態の一覧 */
export function getProviderOverviews(store: Store): ProviderOverview[] {
  return INTEGRATION_DEFS.map((def) => ({
    def,
    status: getConnectionStatus(def, store),
    live: isProviderLive(def),
  }));
}
