"use server";

import { getCurrentUser } from "@/lib/auth";
import { audit, db, newId } from "@/lib/store";
import { base } from "@/lib/seed/helpers";
import { revalidatePath } from "next/cache";
import type { KnowledgeArticle } from "@/lib/types";

export interface Extraction {
  title: string;
  summary: string;
  keyPoints: string[];
  infoType: string;
  companies: string[];
  people: string[];
  industry: string;
  category: string;
  tags: string[];
  successFactors: string[];
  failureFactors: string[];
  risks: string[];
  abengersApplication: string;
  koeniApplication: string;
  confidenceCandidate: "A" | "B" | "C";
  isMock: boolean;
}

/** AIによる情報抽出(要件8-13)。mockモードではヒューリスティックに抽出。 */
export async function extractAction(input: string, kind: string): Promise<Extraction | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "未認証です" };
  const text = input.trim();
  if (text.length < 4) return { error: "取り込む本文またはURLを入力してください。" };

  audit(user.organizationId, user.id, "ingest.extract", undefined, undefined, kind);

  // --- モック抽出(キーワードベース) ---
  const lower = text.toLowerCase();
  const has = (w: string) => text.includes(w) || lower.includes(w.toLowerCase());
  const firstLine = text.split("\n").find((l) => l.trim())?.slice(0, 40) ?? "取り込んだ情報";

  const companies: string[] = [];
  ["ベンチャー・リンク", "船井", "ABENGERS", "コエニ", "JAFCO", "リブ", "ビザスク", "Relic"].forEach((c) => {
    if (has(c)) companies.push(c);
  });

  const category =
    has("FC") || has("フランチャイズ") || has("加盟")
      ? "FC本部構築"
      : has("マーケ") || has("広告") || has("CVR")
        ? "マーケティング"
        : has("採用")
          ? "採用"
          : "経営戦略";

  const failureFactors: string[] = [];
  if (has("訴訟") || has("失敗") || has("破綻")) failureFactors.push("失敗・訴訟に関する記述を検出");
  if (has("加盟金")) failureFactors.push("加盟金の先行回収に関する記述");

  const successFactors: string[] = [];
  if (has("成功") || has("成長") || has("拡大")) successFactors.push("成長・拡大に関する記述を検出");

  return {
    title: firstLine,
    summary: text.slice(0, 140) + (text.length > 140 ? "…" : ""),
    keyPoints: text
      .split(/[。\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 6)
      .slice(0, 4),
    infoType: kind,
    companies,
    people: [],
    industry: has("飲食") || has("カフェ") ? "外食" : has("D2C") ? "D2C" : "—",
    category,
    tags: [category, ...(companies.length ? ["企業言及あり"] : [])],
    successFactors,
    failureFactors,
    risks: failureFactors.length ? ["過去事例の失敗要因と類似の可能性"] : [],
    abengersApplication: "抽出内容をABENGERSの支援メニューへの示唆として要検討。",
    koeniApplication: "マーケティング実行の観点で活用余地を確認。",
    confidenceCandidate: companies.length ? "B" : "C",
    isMock: true,
  };
}

/** AI抽出結果を確認後、ノウハウ下書きとして登録(要件8-13の人間承認前提) */
export async function saveExtractionAction(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "未認証です" };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "タイトルは必須です。" };

  const article: KnowledgeArticle = {
    ...base({
      id: newId("kn"),
      organizationId: user.organizationId,
      status: "pending_review", // 人間の承認待ちとして登録
      visibility: "all_staff",
      confidenceLevel: (String(formData.get("confidenceCandidate")) as "A" | "B" | "C") || "C",
      certaintyLevel: "needs_check",
      createdBy: user.id,
      updatedBy: user.id,
    }),
    title,
    category: String(formData.get("category") ?? "経営戦略"),
    summary: String(formData.get("summary") ?? ""),
    practice: String(formData.get("keyPoints") ?? ""),
    abengersUsage: String(formData.get("abengersApplication") ?? ""),
    koeniUsage: String(formData.get("koeniApplication") ?? ""),
    tags: String(formData.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    importance: "medium",
  };
  db.knowledgeArticles.unshift(article);
  audit(user.organizationId, user.id, "ingest.save", "knowledge", article.id, title);
  revalidatePath("/approvals");
  revalidatePath("/knowledge");
  return { ok: true, id: article.id };
}
