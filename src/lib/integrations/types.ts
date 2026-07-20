/**
 * 外部媒体連携の型定義。
 *
 * 設計方針:
 *   - 各媒体（Google/Instagram/TikTok/LINE/広告/POS）を共通の
 *     IntegrationAdapter 抽象の背後に隠す（拡張可能な受け皿）。
 *   - デモはモックアダプタで動作。実API接続は環境変数＋live-adapters で差し替え。
 *   - 取り込んだ数値は正規化して KPI にマッピングし、
 *     「そのまま保存せず」プレビュー→人が確認してから反映する
 *     （AI 機能と同じ human-in-the-loop）。
 */
import type { KpiCategory } from "@/lib/constants";
import type { Store } from "@/types";

/** 連携プロバイダ種別 */
export type IntegrationProvider =
  | "google_business"
  | "instagram"
  | "tiktok"
  | "line"
  | "ads"
  | "pos";

/** 認証方式 */
export type IntegrationAuthType = "oauth" | "api_key" | "file";

/** 取り込む1指標の仕様（どの KPI に対応するか） */
export interface MetricSpec {
  /** 対応する KPI キー（KPI_DEFINITIONS） */
  kpiKey: string;
  /** モック生成の基準値 */
  base: number;
  /** 小数指標（評価・率）か */
  decimal?: boolean;
}

/** プロバイダ定義（媒体ごとのメタ情報とマッピング） */
export interface IntegrationDefinition {
  provider: IntegrationProvider;
  label: string;
  description: string;
  icon: string; // lucide アイコン名
  /** 取り込む KPI のカテゴリ */
  category: KpiCategory;
  /** 取り込む指標 → KPI マッピング */
  metrics: MetricSpec[];
  authType: IntegrationAuthType;
  /** 接続状態の判定に使う店舗側の媒体URLフィールド（あれば） */
  storeUrlField?: keyof Store;
  /** 口コミ取得に対応するか（Google） */
  providesReviews?: boolean;
  /** 実接続に必要な環境変数名（存在すれば live 対象） */
  envKey?: string;
}

/** 取り込みコンテキスト（アダプタに渡す） */
export interface IntegrationContext {
  store: Store;
  month: string; // YYYY-MM
}

/** 正規化された指標スナップショット */
export interface MetricSnapshot {
  provider: IntegrationProvider;
  storeId: string;
  month: string;
  metrics: { kpiKey: string; value: number }[];
}

/** 口コミ1件 */
export interface ReviewItem {
  author: string;
  rating: number;
  text: string;
  date: string;
}

/** 接続状態 */
export type ConnectionStatus = "connected" | "disconnected" | "error";

/** 同期結果（プレビュー用。保存はしない） */
export interface SyncResult {
  provider: IntegrationProvider;
  storeId: string;
  month: string;
  mode: "mock" | "live";
  fetchedAt: string;
  /** 取り込み値 → KPI へのマッピング（確認後に反映する候補） */
  mappedKpi: { kpiKey: string; label: string; unit: string; value: number }[];
  reviews?: ReviewItem[];
  warnings: string[];
}

/** アダプタ抽象。媒体ごとに実装する。 */
export interface IntegrationAdapter {
  provider: IntegrationProvider;
  definition: IntegrationDefinition;
  /** 実接続が構成済みか（false ならモック） */
  isLive(): boolean;
  fetchMetrics(ctx: IntegrationContext): Promise<MetricSnapshot>;
  fetchReviews?(ctx: IntegrationContext): Promise<ReviewItem[]>;
}
