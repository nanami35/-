import type {
  CertaintyLevel,
  ConfidenceLevel,
  NotificationLevel,
  ScoreSymbol,
  Status,
  TriState,
} from "@/lib/types";

// 表示ラベル・記号の一元管理(要件9・8-14・8-18)

export const STATUS_LABELS: Record<Status, string> = {
  draft: "下書き",
  ai_processing: "AI整理中",
  pending_review: "確認待ち",
  revision_requested: "修正依頼",
  approved: "承認済み",
  published: "公開済み",
  unpublished: "非公開",
  needs_recheck: "要再確認",
  archived: "アーカイブ",
};

export const STATUS_TONE: Record<Status, "gray" | "gold" | "green" | "red" | "blue"> = {
  draft: "gray",
  ai_processing: "blue",
  pending_review: "gold",
  revision_requested: "red",
  approved: "green",
  published: "green",
  unpublished: "gray",
  needs_recheck: "gold",
  archived: "gray",
};

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  A: "A:一次情報",
  B: "B:高信頼の二次情報",
  C: "C:参考・仮説",
};

export const CONFIDENCE_TONE: Record<ConfidenceLevel, "green" | "blue" | "gold"> = {
  A: "green",
  B: "blue",
  C: "gold",
};

export const CERTAINTY_LABELS: Record<CertaintyLevel, string> = {
  confirmed: "確定情報",
  strong: "有力情報",
  hypothesis: "仮説",
  unverified: "未検証",
  needs_check: "要確認",
};

export const CERTAINTY_TONE: Record<CertaintyLevel, "green" | "blue" | "gold" | "red" | "gray"> = {
  confirmed: "green",
  strong: "blue",
  hypothesis: "gold",
  unverified: "gray",
  needs_check: "red",
};

export const NOTIF_LABELS: Record<NotificationLevel, string> = {
  urgent: "緊急",
  important: "重要",
  normal: "通常",
  reference: "参考",
};

export const NOTIF_TONE: Record<NotificationLevel, "red" | "gold" | "blue" | "gray"> = {
  urgent: "red",
  important: "gold",
  normal: "blue",
  reference: "gray",
};

export const SCORE_SYMBOL: Record<ScoreSymbol, string> = {
  double_circle: "◎",
  circle: "○",
  triangle: "△",
  cross: "×",
  "n/a": "対象外",
  unknown: "不明",
};

export const TRISTATE_LABELS: Record<TriState, string> = {
  yes: "あり",
  no: "なし",
  partial: "一部",
  unknown: "不明",
};

export const CATEGORY_LABELS: Record<string, string> = {
  abengers: "ABENGERS型 共同経営",
  marketing: "マーケティング支援",
  consulting: "経営コンサルティング",
  hands_on_vc: "ハンズオンVC",
  cxo_dispatch: "CXO派遣・プロ人材",
  fc_support: "FC本部支援",
  startup_studio: "スタートアップスタジオ",
  coinvest_pe: "共同経営・PE",
  other: "その他",
};

export const IMPORTANCE_LABELS: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export function categoryLabel(key: string): string {
  return CATEGORY_LABELS[key] ?? key;
}
