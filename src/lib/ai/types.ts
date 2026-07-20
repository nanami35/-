/**
 * AI 機能の型定義。
 *
 * 設計方針:
 *   - AI はプロバイダ抽象（mock / Anthropic / OpenAI）の背後に隠す。
 *   - 生成物は必ず人間が編集・承認してから利用する（human-in-the-loop）。
 *     そのため AiDraftResult は「下書き」であり、保存はしない。
 */

/** AI が担うタスク種別 */
export type AiTaskType =
  | "hearing_summary" // ヒアリング内容の要約
  | "issue_extraction" // 店舗課題の抽出
  | "value_analysis" // 5つの価値分析の補助
  | "issue_priority" // 課題の優先順位提案
  | "strategy_proposal" // マーケティング戦略案
  | "kpi_suggestion" // KPI候補の提案
  | "initiative_ideas" // 施策案の作成
  | "reel_script" // Instagramリール台本
  | "review_analysis" // Google口コミの分析
  | "report_draft" // 月次レポートの下書き
  | "kpi_hypothesis" // 数値変化の原因仮説
  | "improvement_ideas"; // 来月の改善案

export interface AiTaskDef {
  type: AiTaskType;
  label: string;
  description: string;
  /** 店舗を対象にするか */
  needsStore: boolean;
  /** 追加の自由入力（例: 口コミ本文, テーマ）のラベル。無ければ不要 */
  freeInputLabel?: string;
  icon: string; // lucide アイコン名
}

export interface AiGenerationRequest {
  task: AiTaskType;
  storeId?: string;
  /** 対象月（レポート等）YYYY-MM */
  month?: string;
  /** 自由入力（口コミ本文・テーマ等） */
  freeInput?: string;
}

export interface AiDraftResult {
  task: AiTaskType;
  /** Markdown 形式の下書き本文 */
  content: string;
  provider: string;
  model: string;
  generatedAt: string;
  /** 必ず表示する注意書き */
  disclaimer: string;
}
