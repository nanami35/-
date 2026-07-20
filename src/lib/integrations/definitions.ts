import type { IntegrationDefinition, IntegrationProvider } from "@/lib/integrations/types";

/**
 * 各媒体の連携定義と、取り込む指標 → KPI マッピング。
 * base はモック生成の基準値（HIKARI 規模を想定）。
 */
export const INTEGRATION_DEFS: IntegrationDefinition[] = [
  {
    provider: "google_business",
    label: "Googleビジネスプロフィール",
    description: "検索・マップの表示回数、ルート検索、通話、口コミ評価を取り込みます。",
    icon: "MapPin",
    category: "meo",
    authType: "oauth",
    storeUrlField: "googleBusinessUrl",
    providesReviews: true,
    envKey: "GOOGLE_BUSINESS_ACCESS_TOKEN",
    metrics: [
      { kpiKey: "google_search_views", base: 12000 },
      { kpiKey: "google_map_views", base: 8000 },
      { kpiKey: "route_searches", base: 900 },
      { kpiKey: "meo_calls", base: 140 },
      { kpiKey: "website_clicks", base: 650 },
      { kpiKey: "review_count", base: 122 },
      { kpiKey: "review_rating", base: 4.1, decimal: true },
    ],
  },
  {
    provider: "instagram",
    label: "Instagram",
    description: "フォロワー・リーチ・インプレッション・保存・リール再生などを取り込みます。",
    icon: "Instagram",
    category: "instagram",
    authType: "oauth",
    storeUrlField: "instagramUrl",
    envKey: "INSTAGRAM_ACCESS_TOKEN",
    metrics: [
      { kpiKey: "ig_followers", base: 2500 },
      { kpiKey: "ig_reach", base: 18000 },
      { kpiKey: "ig_impressions", base: 42000 },
      { kpiKey: "ig_profile_access", base: 3200 },
      { kpiKey: "ig_saves", base: 480 },
      { kpiKey: "ig_reel_plays", base: 26000 },
      { kpiKey: "ig_reservations", base: 14 },
    ],
  },
  {
    provider: "tiktok",
    label: "TikTok",
    description: "フォロワー・再生数・いいね・経由予約を取り込みます。",
    icon: "Music2",
    category: "tiktok",
    authType: "oauth",
    storeUrlField: "tiktokUrl",
    envKey: "TIKTOK_ACCESS_TOKEN",
    metrics: [
      { kpiKey: "tt_followers", base: 900 },
      { kpiKey: "tt_plays", base: 55000 },
      { kpiKey: "tt_likes", base: 3400 },
      { kpiKey: "tt_reservations", base: 6 },
    ],
  },
  {
    provider: "line",
    label: "LINE公式アカウント",
    description: "友だち数・新規登録・ブロック・開封率・経由予約を取り込みます。",
    icon: "MessageCircle",
    category: "line",
    authType: "api_key",
    storeUrlField: "lineUrl",
    envKey: "LINE_CHANNEL_ACCESS_TOKEN",
    metrics: [
      { kpiKey: "line_friends", base: 800 },
      { kpiKey: "line_new", base: 70 },
      { kpiKey: "line_blocks", base: 12 },
      { kpiKey: "line_open_rate", base: 58, decimal: true },
      { kpiKey: "line_click_rate", base: 21, decimal: true },
      { kpiKey: "line_reservations", base: 9 },
    ],
  },
  {
    provider: "ads",
    label: "広告（Google / Meta 等）",
    description: "広告費・表示・クリック・CTR・CPA・ROAS を取り込みます。",
    icon: "Megaphone",
    category: "ads",
    authType: "oauth",
    envKey: "ADS_ACCESS_TOKEN",
    metrics: [
      { kpiKey: "ad_cost", base: 150000 },
      { kpiKey: "ad_impressions", base: 90000 },
      { kpiKey: "ad_clicks", base: 2100 },
      { kpiKey: "ad_ctr", base: 2.3, decimal: true },
      { kpiKey: "ad_cpa", base: 1800 },
      { kpiKey: "ad_roas", base: 480, decimal: true },
    ],
  },
  {
    provider: "pos",
    label: "POSレジ",
    description: "売上・客数・客単価・注文点数を取り込みます。",
    icon: "Receipt",
    category: "sales",
    authType: "api_key",
    envKey: "POS_API_KEY",
    metrics: [
      { kpiKey: "sales", base: 3100000 },
      { kpiKey: "customers", base: 1540 },
      { kpiKey: "avg_spend", base: 2013 },
      { kpiKey: "order_items", base: 2.4, decimal: true },
    ],
  },
];

export function getIntegrationDef(provider: string): IntegrationDefinition | undefined {
  return INTEGRATION_DEFS.find((d) => d.provider === provider);
}

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = INTEGRATION_DEFS.map(
  (d) => d.provider
);
