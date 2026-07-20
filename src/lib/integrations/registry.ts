/**
 * アダプタのファクトリ。
 * 環境変数で実接続（live）とモックを切り替える。
 *   - def.envKey が設定済み かつ INTEGRATION_MODE!=='mock' → live アダプタ
 *   - それ以外 → モックアダプタ
 */
import { getIntegrationDef } from "@/lib/integrations/definitions";
import { createMockAdapter } from "@/lib/integrations/mock-adapter";
import { createLiveAdapter } from "@/lib/integrations/live-adapters";
import type {
  IntegrationAdapter, IntegrationDefinition, ConnectionStatus,
} from "@/lib/integrations/types";
import type { Store } from "@/types";

/** そのプロバイダが実接続構成済みか */
export function isProviderLive(def: IntegrationDefinition): boolean {
  if (process.env.INTEGRATION_MODE === "mock") return false;
  return Boolean(def.envKey && process.env[def.envKey]);
}

/** プロバイダのアダプタを取得（live 構成があれば live、無ければ mock） */
export function getAdapter(provider: string): IntegrationAdapter {
  const def = getIntegrationDef(provider);
  if (!def) throw new Error(`未知の連携プロバイダ: ${provider}`);
  return isProviderLive(def) ? createLiveAdapter(def) : createMockAdapter(def);
}

/**
 * 店舗×プロバイダの接続状態。
 *   - 実接続構成済み → connected
 *   - URL連携型で店舗にURL登録あり → connected（媒体は紐付け済み）
 *   - それ以外 → disconnected（デモではモック取得は可能）
 */
export function getConnectionStatus(def: IntegrationDefinition, store: Store): ConnectionStatus {
  if (isProviderLive(def)) return "connected";
  if (def.storeUrlField && store[def.storeUrlField]) return "connected";
  return "disconnected";
}
