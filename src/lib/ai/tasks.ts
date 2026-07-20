import type { AiTaskDef } from "@/lib/ai/types";

/** AI 機能カタログ。UI（AIアシスタント画面）と各画面のボタンから参照する。 */
export const AI_TASKS: AiTaskDef[] = [
  { type: "hearing_summary", label: "ヒアリング要約", description: "初回ヒアリングの内容を要約し、要点を整理します。", needsStore: true, icon: "ClipboardList" },
  { type: "issue_extraction", label: "店舗課題の抽出", description: "ヒアリングと店舗診断から、重要な課題候補を抽出します。", needsStore: true, icon: "AlertTriangle" },
  { type: "value_analysis", label: "5つの価値分析の補助", description: "診断結果を5つの価値の観点で分析・考察します。", needsStore: true, icon: "Gauge" },
  { type: "issue_priority", label: "課題の優先順位提案", description: "抽出された課題の優先順位を提案します。", needsStore: true, icon: "ListChecks" },
  { type: "strategy_proposal", label: "マーケティング戦略案", description: "現状分析からマーケティング戦略の草案を作成します。", needsStore: true, icon: "Target" },
  { type: "kpi_suggestion", label: "KPI候補の提案", description: "店舗の目標に沿った重点KPIの候補を提案します。", needsStore: true, icon: "LineChart" },
  { type: "initiative_ideas", label: "施策案の作成", description: "課題・戦略を踏まえた具体的な施策案を作成します。", needsStore: true, icon: "Rocket" },
  { type: "reel_script", label: "リール台本の作成", description: "Instagramリールの構成・台本を作成します。", needsStore: true, freeInputLabel: "テーマ（任意）", icon: "Instagram" },
  { type: "review_analysis", label: "口コミ分析", description: "Google口コミを貼り付けると、傾向と改善点を分析します。", needsStore: true, freeInputLabel: "口コミ本文（複数可）", icon: "MessageSquare" },
  { type: "report_draft", label: "月次レポート下書き", description: "KPI・施策から月次レポートの下書きを作成します。", needsStore: true, icon: "FileText" },
  { type: "kpi_hypothesis", label: "数値変化の原因仮説", description: "KPIの推移から、変化の原因仮説を作成します。", needsStore: true, icon: "TrendingUp" },
  { type: "improvement_ideas", label: "来月の改善案", description: "直近の成果から、来月の改善案を作成します。", needsStore: true, icon: "Lightbulb" },
];

export function getAiTask(type: string): AiTaskDef | undefined {
  return AI_TASKS.find((t) => t.type === type);
}
