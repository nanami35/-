/**
 * AI サービス層。
 * コンテキストをデータ層（org スコープ済み）から収集し、
 * タスク別のプロンプトを組み立ててプロバイダに生成させる。
 * モック時はコンテキストから雛形（buildMockDraft）を生成する。
 *
 * 生成物は「下書き」であり、保存はしない（human-in-the-loop）。
 */
import { getAiProvider, isAiLive } from "@/lib/ai/provider";
import { getAiTask } from "@/lib/ai/tasks";
import type { AiGenerationRequest, AiDraftResult, AiTaskType } from "@/lib/ai/types";
import {
  getStore, getClient, getHearingByStore, getLatestDiagnosis,
  getIssuesByStore, getStrategyByStore, getKpiByStore, getInitiativesByStore,
} from "@/lib/data";
import { computeDiagnosis } from "@/lib/scoring";
import { HEARING_SECTIONS, KPI_DEFINITIONS, REPORT_SECTIONS } from "@/lib/constants";
import { formatCurrency, formatNumber, changeRate } from "@/lib/utils";
import type { Store } from "@/types";

const DISCLAIMER =
  "AIが生成した下書きです。数値・事実関係を必ず担当者が確認し、編集・承認したうえでご利用ください。そのままの保存・送付は行わないでください。";

const SYSTEM_BASE =
  "あなたは飲食店マーケティング支援会社のシニアコンサルタントです。" +
  "与えられた店舗の実データに基づき、日本語で、具体的かつ実務で使える下書きを作成します。" +
  "事実に基づかない数値を創作せず、提供データの範囲で述べます。" +
  "これはコンサルタントが編集・承認する前提の『下書き』であり、断定を避け、必要に応じて確認事項を明記します。" +
  "出力は Markdown で、見出し・箇条書きを用いて整理します。";

interface StoreContext {
  store: Store;
  clientName: string;
  hearingText: string;
  diagnosisText: string;
  issuesText: string;
  strategyText: string;
  kpiText: string;
  initiativesText: string;
}

async function gatherStoreContext(storeId: string): Promise<StoreContext | null> {
  const store = await getStore(storeId);
  if (!store) return null;
  const [client, hearing, diagnosis, issues, strategy, kpi, initiatives] =
    await Promise.all([
      getClient(store.clientId),
      getHearingByStore(storeId),
      getLatestDiagnosis(storeId),
      getIssuesByStore(storeId),
      getStrategyByStore(storeId),
      getKpiByStore(storeId),
      getInitiativesByStore(storeId),
    ]);

  const hearingText = hearing
    ? HEARING_SECTIONS.flatMap((sec) =>
        sec.fields
          .filter((f) => hearing.fields[f.key])
          .map((f) => `- ${f.label}: ${hearing.fields[f.key]}`)
      ).join("\n")
    : "（ヒアリング未登録）";

  let diagnosisText = "（診断未実施）";
  if (diagnosis) {
    const r = computeDiagnosis(diagnosis.scores);
    diagnosisText =
      `総合 ${r.total}点。` +
      r.categories.map((c) => `${c.label} ${c.score}点`).join(" / ") +
      (diagnosis.summary ? `\n所見: ${diagnosis.summary}` : "");
  }

  const issuesText = issues.length
    ? issues.map((i) => `- ${i.title}（影響度${i.impact}/緊急度${i.urgency}）`).join("\n")
    : "（課題未登録）";

  const strategyText = strategy
    ? `目標: ${strategy.goal}\nテーマ: ${strategy.theme ?? "—"}\nセンターピン: ${strategy.centerPin ?? "—"}`
    : "（戦略未設計）";

  // 直近2ヶ月の主要KPI
  const months = Array.from(new Set(kpi.map((k) => k.month))).sort();
  const lastMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];
  const keyKeys = ["sales", "customers", "avg_spend", "repeat_rate", "ig_followers", "review_count", "line_friends"];
  const kpiText = lastMonth
    ? keyKeys
        .map((key) => {
          const def = KPI_DEFINITIONS.find((d) => d.key === key);
          if (!def) return null;
          const cur = kpi.find((k) => k.month === lastMonth && k.kpiKey === key)?.actual;
          const prev = kpi.find((k) => k.month === prevMonth && k.kpiKey === key)?.actual;
          if (cur == null) return null;
          const mom = prev != null ? changeRate(cur, prev) : null;
          const value = def.unit === "円" ? formatCurrency(cur) : formatNumber(cur, def.unit);
          return `- ${def.label}: ${value}${mom != null ? `（前月比 ${mom >= 0 ? "+" : ""}${mom.toFixed(1)}%）` : ""}`;
        })
        .filter(Boolean)
        .join("\n")
    : "（KPI未入力）";

  const initiativesText = initiatives.length
    ? initiatives.map((i) => `- ${i.name}（${i.category} / ${i.status}）`).join("\n")
    : "（施策未登録）";

  return {
    store,
    clientName: client?.name ?? "",
    hearingText,
    diagnosisText,
    issuesText,
    strategyText,
    kpiText,
    initiativesText,
  };
}

/** タスク別のユーザープロンプト */
function buildUserPrompt(task: AiTaskType, ctx: StoreContext, req: AiGenerationRequest): string {
  const header = `【店舗】${ctx.store.name}（${ctx.store.businessType} / ${ctx.clientName}）`;
  const map: Record<AiTaskType, string> = {
    hearing_summary: `${header}\n\n次のヒアリング内容を、経営者に共有できる形で要約してください。要点・強み・課題・機会を整理してください。\n\n[ヒアリング]\n${ctx.hearingText}`,
    issue_extraction: `${header}\n\nヒアリングと診断結果から、重要な課題を3〜6件抽出し、それぞれ根拠・影響度・改善の方向性を示してください。\n\n[ヒアリング]\n${ctx.hearingText}\n\n[診断]\n${ctx.diagnosisText}`,
    value_analysis: `${header}\n\n診断結果を「5つの価値（商品・接客・雰囲気・イメージ・体験）」の観点で分析し、各価値の強み・弱み・改善余地を考察してください。\n\n[診断]\n${ctx.diagnosisText}`,
    issue_priority: `${header}\n\n次の課題群について、影響度・緊急度・実行難易度を考慮した優先順位と、その理由を提案してください。\n\n[課題]\n${ctx.issuesText}`,
    strategy_proposal: `${header}\n\n現状分析からマーケティング戦略の草案を作成してください。目標・ターゲット・ポジショニング・センターピン・集客戦略・売上向上戦略（客数×客単価の分解）を含めてください。\n\n[診断]\n${ctx.diagnosisText}\n\n[課題]\n${ctx.issuesText}\n\n[ヒアリング抜粋]\n${ctx.hearingText}`,
    kpi_suggestion: `${header}\n\nこの店舗の目標達成に向けて、重点的に追うべきKPIの候補と目標水準の考え方を提案してください。\n\n[戦略]\n${ctx.strategyText}\n\n[直近KPI]\n${ctx.kpiText}`,
    initiative_ideas: `${header}\n\n課題と戦略を踏まえ、実行可能な施策案を5件程度、目的・仮説・実施内容・想定KPIとともに作成してください。\n\n[課題]\n${ctx.issuesText}\n\n[戦略]\n${ctx.strategyText}`,
    reel_script: `${header}\n\nInstagramリールの構成・台本を作成してください。${req.freeInput ? `テーマ: ${req.freeInput}。` : ""}冒頭2秒のフック、シーン構成、テロップ案、キャプション、ハッシュタグ案を含めてください。ターゲットは ${ctx.store.mainCustomerSegment ?? "近隣層"} です。`,
    review_analysis: `${header}\n\n次のGoogle口コミを分析し、良い点・不満点の傾向、頻出キーワード、改善アクションを整理してください。\n\n[口コミ]\n${req.freeInput ?? "（口コミ本文が入力されていません）"}`,
    report_draft: `${header}\n\n${req.month ?? "今月"}の月次レポートの下書きを、次の12構成に沿って作成してください:\n${REPORT_SECTIONS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n[直近KPI]\n${ctx.kpiText}\n\n[実施施策]\n${ctx.initiativesText}\n\n[課題]\n${ctx.issuesText}`,
    kpi_hypothesis: `${header}\n\n直近のKPI推移を踏まえ、数値変化の原因仮説を複数挙げ、検証方法とともに整理してください。\n\n[直近KPI]\n${ctx.kpiText}\n\n[実施施策]\n${ctx.initiativesText}`,
    improvement_ideas: `${header}\n\n直近の成果と課題から、来月の改善案（重点施策と期待効果）を提案してください。\n\n[直近KPI]\n${ctx.kpiText}\n\n[課題]\n${ctx.issuesText}\n\n[実施施策]\n${ctx.initiativesText}`,
  };
  return map[task];
}

/** モック時のタスク別下書き（コンテキスト由来） */
function buildMockDraft(task: AiTaskType, ctx: StoreContext, req: AiGenerationRequest): string {
  const note = "> ⚠️ デモ用のモック下書きです（外部AI未接続）。担当者が編集・承認してご利用ください。\n";
  const s = ctx.store;
  if (task === "report_draft") {
    const body = REPORT_SECTIONS.map((sec, i) => {
      const filler: Record<string, string> = {
        "KPIサマリー": ctx.kpiText,
        "実施施策": ctx.initiativesText,
        "課題": ctx.issuesText,
      };
      return `## ${i + 1}. ${sec}\n${filler[sec] ?? "（担当者が記入）"}`;
    }).join("\n\n");
    return `${note}\n# ${s.name} 月次レポート（${req.month ?? "対象月"}）下書き\n\n${body}`;
  }
  if (task === "reel_script") {
    return `${note}\n# リール台本（${req.freeInput || "看板メニュー"}）\n\n**フック(0-2秒)**: 「${s.name}の“あの一皿”、知ってますか？」\n\n**構成**\n1. 調理/仕込みの湯気（0-3秒）\n2. 断面・シズル（3-6秒）\n3. 実食リアクション（6-10秒）\n4. 店内の雰囲気（10-13秒）\n\n**テロップ案**: 「渋谷徒歩5分」「平日限定」\n**キャプション**: 香りまで届けたい一皿。ご予約はプロフィールから。\n**ハッシュタグ**: #${s.genre.replace(/\s|\//g, "")} #渋谷カフェ #看板メニュー`;
  }
  const contextBlocks: Record<AiTaskType, string> = {
    hearing_summary: `## 要約\n${ctx.hearingText}\n\n## 所見\n担当者が加筆してください。`,
    issue_extraction: `## 抽出された課題（案）\n${ctx.issuesText}\n\n## 根拠\n${ctx.diagnosisText}`,
    value_analysis: `## 5つの価値の考察\n${ctx.diagnosisText}\n\n各価値の改善余地を担当者が具体化してください。`,
    issue_priority: `## 優先順位（案）\n${ctx.issuesText}\n\n影響度×緊急度×(4−難易度)での自動スコアも併せてご確認ください。`,
    strategy_proposal: `## 戦略草案\n${ctx.strategyText}\n\n## 現状分析\n${ctx.diagnosisText}\n\n## 課題\n${ctx.issuesText}`,
    kpi_suggestion: `## 重点KPI候補\n${ctx.kpiText}\n\n目標水準は戦略に合わせて担当者が設定してください。`,
    initiative_ideas: `## 施策案\n${ctx.issuesText}\n\n各課題に対する具体施策を担当者が肉付けしてください。`,
    reel_script: "",
    review_analysis: `## 口コミ分析（案）\n入力: ${req.freeInput ? "あり" : "なし"}\n\n傾向・改善アクションを担当者が整理してください。`,
    report_draft: "",
    kpi_hypothesis: `## 原因仮説（案）\n${ctx.kpiText}\n\n各変化の要因と検証方法を担当者が具体化してください。`,
    improvement_ideas: `## 来月の改善案（案）\n${ctx.kpiText}\n\n${ctx.issuesText}`,
  };
  const label = getAiTask(task)?.label ?? "AI下書き";
  return `${note}\n# ${s.name}｜${label}\n\n${contextBlocks[task]}`;
}

/** 下書きを生成する（サーバー専用） */
export async function generateDraft(req: AiGenerationRequest): Promise<AiDraftResult> {
  const provider = getAiProvider();
  const def = getAiTask(req.task);
  if (!def) throw new Error("不明なAIタスクです。");

  let content: string;
  if (def.needsStore) {
    if (!req.storeId) throw new Error("店舗が指定されていません。");
    const ctx = await gatherStoreContext(req.storeId);
    if (!ctx) throw new Error("店舗が見つかりません。");
    if (isAiLive()) {
      content = await provider.generate(SYSTEM_BASE, buildUserPrompt(req.task, ctx, req));
    } else {
      content = buildMockDraft(req.task, ctx, req);
    }
  } else {
    content = isAiLive()
      ? await provider.generate(SYSTEM_BASE, req.freeInput ?? "")
      : `> ⚠️ デモ用のモック下書きです。\n\n${req.freeInput ?? ""}`;
  }

  return {
    task: req.task,
    content,
    provider: provider.name,
    model: provider.model,
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
  };
}
