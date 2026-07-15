/**
 * アプリ全体で使用する定数定義。
 * ハードコードを避け、ラベル・選択肢・評価軸などをここに集約する。
 */

/* ============================================================
 * ロール / 権限
 * ========================================================== */
export const ROLES = {
  ADMIN: "admin",
  MARKETER: "marketer",
  CLIENT: "client",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "管理者",
  marketer: "マーケティング担当者",
  client: "クライアント",
};

/* ============================================================
 * サイドバーナビゲーション
 * 各メニューの表示可能ロールを roles で制御する
 * ========================================================== */
export type NavGroup = "運用" | "分析" | "戦略・施策" | "管理";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide-react のアイコン名
  roles: Role[];
  group: NavGroup;
  phase: 1 | 2 | 3;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "ダッシュボード", href: "/dashboard", icon: "LayoutDashboard", roles: ["admin", "marketer"], group: "運用", phase: 1 },
  { label: "クライアント", href: "/clients", icon: "Building2", roles: ["admin", "marketer"], group: "運用", phase: 1 },
  { label: "店舗", href: "/stores", icon: "Store", roles: ["admin", "marketer"], group: "運用", phase: 1 },
  { label: "ヒアリング", href: "/hearings", icon: "ClipboardList", roles: ["admin", "marketer"], group: "分析", phase: 1 },
  { label: "店舗診断", href: "/diagnoses", icon: "Gauge", roles: ["admin", "marketer"], group: "分析", phase: 1 },
  { label: "市場・商圏分析", href: "/market", icon: "Map", roles: ["admin", "marketer"], group: "分析", phase: 2 },
  { label: "競合分析", href: "/competitors", icon: "Swords", roles: ["admin", "marketer"], group: "分析", phase: 2 },
  { label: "需要・供給分析", href: "/demand-supply", icon: "Scale", roles: ["admin", "marketer"], group: "分析", phase: 2 },
  { label: "課題", href: "/issues", icon: "AlertTriangle", roles: ["admin", "marketer"], group: "戦略・施策", phase: 1 },
  { label: "戦略", href: "/strategies", icon: "Target", roles: ["admin", "marketer"], group: "戦略・施策", phase: 2 },
  { label: "KPI", href: "/kpi", icon: "LineChart", roles: ["admin", "marketer"], group: "戦略・施策", phase: 1 },
  { label: "施策", href: "/initiatives", icon: "Rocket", roles: ["admin", "marketer"], group: "戦略・施策", phase: 1 },
  { label: "SNSコンテンツ", href: "/social", icon: "Instagram", roles: ["admin", "marketer"], group: "戦略・施策", phase: 2 },
  { label: "タスク", href: "/tasks", icon: "ListChecks", roles: ["admin", "marketer"], group: "運用", phase: 1 },
  { label: "ミーティング", href: "/meetings", icon: "Users", roles: ["admin", "marketer"], group: "運用", phase: 2 },
  { label: "月次レポート", href: "/reports", icon: "FileText", roles: ["admin", "marketer"], group: "運用", phase: 1 },
  { label: "ナレッジ", href: "/knowledge", icon: "BookOpen", roles: ["admin", "marketer"], group: "分析", phase: 2 },
  { label: "AIアシスタント", href: "/ai", icon: "Sparkles", roles: ["admin", "marketer"], group: "戦略・施策", phase: 3 },
  { label: "テンプレート", href: "/templates", icon: "LayoutTemplate", roles: ["admin"], group: "管理", phase: 2 },
  { label: "ユーザー管理", href: "/users", icon: "UserCog", roles: ["admin"], group: "管理", phase: 1 },
  { label: "設定", href: "/settings", icon: "Settings", roles: ["admin", "marketer"], group: "管理", phase: 1 },
];

/* ============================================================
 * 契約 / 支援フェーズ
 * ========================================================== */
export const CONTRACT_STATUS = {
  prospect: "見込み",
  negotiating: "商談中",
  active: "契約中",
  paused: "休止中",
  ended: "契約終了",
} as const;
export type ContractStatus = keyof typeof CONTRACT_STATUS;

export const SUPPORT_PHASES = [
  "ヒアリング",
  "現状分析",
  "戦略設計",
  "施策実行",
  "効果検証",
  "改善提案",
] as const;
export type SupportPhase = (typeof SUPPORT_PHASES)[number];

export const CONTRACT_PLANS = ["ライト", "スタンダード", "プレミアム"] as const;
export type ContractPlan = (typeof CONTRACT_PLANS)[number];

/* ============================================================
 * 初回ヒアリング：入力項目（セクション別）
 * ========================================================== */
export interface HearingField {
  key: string;
  label: string;
  multiline?: boolean;
}
export interface HearingSection {
  title: string;
  fields: HearingField[];
}

export const HEARING_SECTIONS: HearingSection[] = [
  {
    title: "経営・ビジョン",
    fields: [
      { key: "background", label: "店舗を始めた背景", multiline: true },
      { key: "philosophy", label: "経営理念", multiline: true },
      { key: "vision", label: "将来のビジョン", multiline: true },
    ],
  },
  {
    title: "商品・サービス",
    fields: [
      { key: "products", label: "現在の商品・サービス", multiline: true },
      { key: "flagship", label: "主力商品" },
      { key: "highMarginProduct", label: "利益率の高い商品" },
    ],
  },
  {
    title: "顧客",
    fields: [
      { key: "idealCustomer", label: "来店してほしい顧客" },
      { key: "currentCustomer", label: "現在の主要顧客" },
      { key: "visitMotive", label: "利用動機・利用機会" },
      { key: "visitFrequency", label: "来店頻度" },
    ],
  },
  {
    title: "集客・課題",
    fields: [
      { key: "currentChannels", label: "現在の集客経路" },
      { key: "acquisitionPain", label: "集客上の悩み", multiline: true },
      { key: "salesPain", label: "売上上の悩み", multiline: true },
      { key: "operationPain", label: "オペレーション上の悩み", multiline: true },
      { key: "hrPain", label: "人材上の悩み", multiline: true },
    ],
  },
  {
    title: "競合・自店舗分析",
    fields: [
      { key: "competitors", label: "競合と認識している店舗" },
      { key: "strengths", label: "自店舗の強み", multiline: true },
      { key: "weaknesses", label: "自店舗の弱み", multiline: true },
    ],
  },
  {
    title: "過去施策",
    fields: [
      { key: "pastInitiatives", label: "過去に実施した施策", multiline: true },
      { key: "successInitiatives", label: "成功した施策" },
      { key: "failedInitiatives", label: "失敗した施策" },
    ],
  },
  {
    title: "目標・リソース",
    fields: [
      { key: "salesTarget", label: "今後達成したい売上" },
      { key: "deadline", label: "いつまでに達成したいか" },
      { key: "budget", label: "マーケティング予算" },
      { key: "resource", label: "対応可能な社内リソース", multiline: true },
    ],
  },
];

/* ============================================================
 * 店舗診断：5つの価値と評価項目
 * ========================================================== */
export interface DiagnosisCategoryDef {
  key: string;
  label: string;
  description: string;
  items: string[];
}

export const DIAGNOSIS_CATEGORIES: DiagnosisCategoryDef[] = [
  {
    key: "product",
    label: "商品価値",
    description: "味・品質・独自性など商品そのものの魅力",
    items: [
      "味", "品質", "見た目", "独自性", "価格とのバランス",
      "メニュー構成", "看板商品の有無", "利益商品の有無", "季節商品の有無", "再来店したくなる商品力",
    ],
  },
  {
    key: "service",
    label: "接客価値",
    description: "スタッフの接客・対応品質",
    items: [
      "第一印象", "挨拶", "商品説明", "提案力", "提供スピード",
      "気配り", "クレーム対応", "スタッフの清潔感", "接客の均一性", "再来店を促す対応",
    ],
  },
  {
    key: "atmosphere",
    label: "雰囲気価値",
    description: "空間・内装・快適性",
    items: [
      "外観", "入店しやすさ", "内装", "清潔感", "照明",
      "音楽", "匂い", "席の快適性", "動線", "滞在しやすさ",
    ],
  },
  {
    key: "image",
    label: "イメージ価値",
    description: "ブランド・世界観・認知",
    items: [
      "店名", "ロゴ", "ブランドコンセプト", "写真", "SNSの統一感",
      "メニュー表", "ターゲットとの一致", "価格イメージ", "地域での認知度", "口コミ上の印象",
    ],
  },
  {
    key: "experience",
    label: "体験価値",
    description: "来店前から退店後までの一連の体験",
    items: [
      "来店前の期待", "予約体験", "入店時の体験", "注文体験", "食事中の体験",
      "会計体験", "退店時の体験", "写真を撮りたくなる要素", "人に話したくなる要素", "再来店したくなる仕掛け",
    ],
  },
];

/** 5段階評価のラベル */
export const SCORE_LEVELS = [
  { value: 1, label: "要改善" },
  { value: 2, label: "やや不足" },
  { value: 3, label: "標準" },
  { value: 4, label: "良好" },
  { value: 5, label: "優秀" },
] as const;

/* ============================================================
 * 需要・供給分析（5つの価値で分類）
 * ========================================================== */
export const VALUE_AXES = DIAGNOSIS_CATEGORIES.map((c) => ({
  key: c.key,
  label: c.label,
}));

/* ============================================================
 * 課題管理
 * ========================================================== */
export const ISSUE_CATEGORIES = [
  "集客", "商品", "接客", "店内環境", "ブランディング",
  "リピート", "客単価", "オペレーション", "人材", "数値管理",
] as const;

export const ISSUE_STATUS = {
  open: "未着手",
  in_progress: "対応中",
  resolved: "解決済み",
  monitoring: "経過観察",
} as const;
export type IssueStatus = keyof typeof ISSUE_STATUS;

export const IMPACT_LEVELS = [
  { value: 1, label: "低" },
  { value: 2, label: "中" },
  { value: 3, label: "高" },
] as const;

/* ============================================================
 * KPI 定義（カテゴリ別）
 * ========================================================== */
export interface KpiDef {
  key: string;
  label: string;
  unit: string;
  category: KpiCategory;
  /** 高いほど良いか（達成率評価の向き） */
  direction: "up" | "down";
}

export const KPI_CATEGORIES = {
  sales: "売上系",
  acquisition: "集客系",
  meo: "Google・MEO",
  instagram: "Instagram",
  tiktok: "TikTok",
  line: "LINE",
  ads: "広告",
} as const;
export type KpiCategory = keyof typeof KPI_CATEGORIES;

export const KPI_DEFINITIONS: KpiDef[] = [
  // 売上系
  { key: "sales", label: "売上", unit: "円", category: "sales", direction: "up" },
  { key: "customers", label: "客数", unit: "人", category: "sales", direction: "up" },
  { key: "avg_spend", label: "客単価", unit: "円", category: "sales", direction: "up" },
  { key: "new_customers", label: "新規客数", unit: "人", category: "sales", direction: "up" },
  { key: "repeat_customers", label: "リピート客数", unit: "人", category: "sales", direction: "up" },
  { key: "repeat_rate", label: "リピート率", unit: "%", category: "sales", direction: "up" },
  { key: "visit_frequency", label: "来店頻度", unit: "回/月", category: "sales", direction: "up" },
  { key: "order_items", label: "注文点数", unit: "点", category: "sales", direction: "up" },
  { key: "cost_rate", label: "原価率", unit: "%", category: "sales", direction: "down" },
  { key: "labor_rate", label: "人件費率", unit: "%", category: "sales", direction: "down" },
  { key: "fl_rate", label: "FL比率", unit: "%", category: "sales", direction: "down" },
  { key: "operating_profit", label: "営業利益", unit: "円", category: "sales", direction: "up" },
  { key: "operating_margin", label: "営業利益率", unit: "%", category: "sales", direction: "up" },
  // 集客系
  { key: "reservations", label: "予約数", unit: "件", category: "acquisition", direction: "up" },
  { key: "phone_inquiries", label: "電話問い合わせ数", unit: "件", category: "acquisition", direction: "up" },
  { key: "web_reservations", label: "Web予約数", unit: "件", category: "acquisition", direction: "up" },
  { key: "coupon_uses", label: "クーポン利用数", unit: "件", category: "acquisition", direction: "up" },
  { key: "ad_visits", label: "広告経由来店数", unit: "人", category: "acquisition", direction: "up" },
  { key: "referral_visits", label: "紹介経由来店数", unit: "人", category: "acquisition", direction: "up" },
  // Google・MEO
  { key: "google_search_views", label: "Google検索表示回数", unit: "回", category: "meo", direction: "up" },
  { key: "google_map_views", label: "Googleマップ表示回数", unit: "回", category: "meo", direction: "up" },
  { key: "route_searches", label: "ルート検索数", unit: "回", category: "meo", direction: "up" },
  { key: "meo_calls", label: "電話数", unit: "件", category: "meo", direction: "up" },
  { key: "website_clicks", label: "Webサイトクリック数", unit: "回", category: "meo", direction: "up" },
  { key: "review_count", label: "口コミ件数", unit: "件", category: "meo", direction: "up" },
  { key: "review_rating", label: "平均評価", unit: "点", category: "meo", direction: "up" },
  { key: "review_reply_rate", label: "口コミ返信率", unit: "%", category: "meo", direction: "up" },
  // Instagram
  { key: "ig_followers", label: "フォロワー数", unit: "人", category: "instagram", direction: "up" },
  { key: "ig_reach", label: "リーチ", unit: "回", category: "instagram", direction: "up" },
  { key: "ig_impressions", label: "インプレッション", unit: "回", category: "instagram", direction: "up" },
  { key: "ig_profile_access", label: "プロフィールアクセス", unit: "回", category: "instagram", direction: "up" },
  { key: "ig_saves", label: "保存数", unit: "回", category: "instagram", direction: "up" },
  { key: "ig_shares", label: "シェア数", unit: "回", category: "instagram", direction: "up" },
  { key: "ig_reel_plays", label: "リール再生数", unit: "回", category: "instagram", direction: "up" },
  { key: "ig_reservations", label: "Instagram経由予約数", unit: "件", category: "instagram", direction: "up" },
  // TikTok
  { key: "tt_followers", label: "フォロワー数", unit: "人", category: "tiktok", direction: "up" },
  { key: "tt_plays", label: "再生数", unit: "回", category: "tiktok", direction: "up" },
  { key: "tt_likes", label: "いいね数", unit: "回", category: "tiktok", direction: "up" },
  { key: "tt_reservations", label: "TikTok経由予約数", unit: "件", category: "tiktok", direction: "up" },
  // LINE
  { key: "line_friends", label: "友だち数", unit: "人", category: "line", direction: "up" },
  { key: "line_new", label: "新規登録数", unit: "人", category: "line", direction: "up" },
  { key: "line_blocks", label: "ブロック数", unit: "人", category: "line", direction: "down" },
  { key: "line_open_rate", label: "開封率", unit: "%", category: "line", direction: "up" },
  { key: "line_click_rate", label: "クリック率", unit: "%", category: "line", direction: "up" },
  { key: "line_reservations", label: "LINE経由予約数", unit: "件", category: "line", direction: "up" },
  // 広告
  { key: "ad_cost", label: "広告費", unit: "円", category: "ads", direction: "down" },
  { key: "ad_impressions", label: "表示回数", unit: "回", category: "ads", direction: "up" },
  { key: "ad_clicks", label: "クリック数", unit: "回", category: "ads", direction: "up" },
  { key: "ad_ctr", label: "CTR", unit: "%", category: "ads", direction: "up" },
  { key: "ad_cpa", label: "CPA", unit: "円", category: "ads", direction: "down" },
  { key: "ad_roas", label: "ROAS", unit: "%", category: "ads", direction: "up" },
];

/* ============================================================
 * 施策管理
 * ========================================================== */
export const INITIATIVE_CATEGORIES = [
  "Instagram", "TikTok", "Google・MEO", "LINE", "Webサイト", "広告",
  "口コミ", "紹介", "チラシ", "メニュー改善", "商品開発", "接客改善",
  "店内改善", "リピート施策", "客単価向上", "コラボ", "イベント", "その他",
] as const;

export const INITIATIVE_STATUS = {
  planned: "計画中",
  in_progress: "実行中",
  completed: "完了",
  paused: "保留",
  cancelled: "中止",
} as const;
export type InitiativeStatus = keyof typeof INITIATIVE_STATUS;

/* ============================================================
 * SNSコンテンツ
 * ========================================================== */
export const SOCIAL_PLATFORMS = ["Instagram", "TikTok", "LINE", "Googleビジネス", "X"] as const;

export const SOCIAL_STATUS = {
  idea: "アイデア",
  planning: "企画中",
  shooting: "撮影待ち",
  editing: "編集中",
  review: "確認待ち",
  fixing: "修正中",
  scheduled: "投稿予約",
  posted: "投稿済み",
  analyzed: "分析済み",
} as const;
export type SocialStatus = keyof typeof SOCIAL_STATUS;

/* ============================================================
 * タスク
 * ========================================================== */
export const TASK_STATUS = {
  todo: "未着手",
  in_progress: "進行中",
  review: "確認中",
  done: "完了",
} as const;
export type TaskStatus = keyof typeof TASK_STATUS;

export const PRIORITY = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "緊急",
} as const;
export type Priority = keyof typeof PRIORITY;

/* ============================================================
 * 月次レポート
 * ========================================================== */
export const REPORT_SECTIONS = [
  "今月の総括",
  "KPIサマリー",
  "売上・客数・客単価の推移",
  "集客チャネル別の成果",
  "実施施策",
  "施策ごとの成果",
  "良かった点",
  "課題",
  "改善案",
  "来月の重点施策",
  "来月のKPI目標",
  "クライアントへの依頼事項",
] as const;

export const REPORT_STATUS = {
  draft: "下書き",
  review: "確認中",
  approved: "承認済み",
  shared: "共有済み",
} as const;
export type ReportStatus = keyof typeof REPORT_STATUS;
