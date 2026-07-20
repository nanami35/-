/**
 * 実API接続アダプタの拡張点（スタブ）。
 *
 * ここに各媒体の本実装を追加する。認証情報は環境変数（サーバー専用）で管理し、
 * 各媒体のAPIから取得した生データを MetricSnapshot / ReviewItem に正規化して返す。
 * 未実装の間は「要実装」のエラーを投げ、registry がモックへフォールバックする。
 *
 * 実装ガイド（例）:
 *   - google_business: Business Profile Performance API → 表示回数/通話/ルート/口コミ
 *   - instagram:       Instagram Graph API (insights)   → フォロワー/リーチ/保存/リール
 *   - tiktok:          TikTok Business API               → 再生/いいね/フォロワー
 *   - line:            LINE Messaging/Insight API        → 友だち/開封/クリック
 *   - ads:             Google Ads / Meta Marketing API   → 費用/表示/CV/ROAS
 *   - pos:             各POSベンダーAPI / CSV取込          → 売上/客数/客単価
 */
import type {
  IntegrationAdapter, IntegrationContext, IntegrationDefinition,
  MetricSnapshot, ReviewItem,
} from "@/lib/integrations/types";

class NotImplementedError extends Error {
  constructor(provider: string, envKey?: string) {
    super(
      `「${provider}」の実API連携は未実装です。live-adapters.ts に実装し、` +
        (envKey ? `環境変数 ${envKey} を設定してください。` : "認証情報を設定してください。")
    );
    this.name = "NotImplementedError";
  }
}

/**
 * 実接続アダプタ（現状は拡張点のスタブ）。
 * 本実装時は fetchMetrics / fetchReviews を各媒体のAPI呼び出しに置き換える。
 */
export function createLiveAdapter(def: IntegrationDefinition): IntegrationAdapter {
  return {
    provider: def.provider,
    definition: def,
    isLive: () => true,
    async fetchMetrics(_ctx: IntegrationContext): Promise<MetricSnapshot> {
      // TODO: 各媒体のAPIを呼び出し、def.metrics に対応する値を取得して正規化する
      throw new NotImplementedError(def.label, def.envKey);
    },
    fetchReviews: def.providesReviews
      ? async (_ctx: IntegrationContext): Promise<ReviewItem[]> => {
          throw new NotImplementedError(def.label, def.envKey);
        }
      : undefined,
  };
}
