import "server-only";
import type { AiAnswer, AiCitation, SafeUser } from "@/lib/types";
import { search, type SearchDoc } from "@/lib/search";
import { complete, isMockMode, type ChatTurn } from "./provider";
import { CERTAINTY_LABELS, CONFIDENCE_LABELS } from "@/lib/labels";

// =====================================================================
// RAG検索・質問回答(要件 8-4 / 15)
// 1. ユーザーの閲覧権限内のドキュメントのみを検索(権限外は絶対に含めない)
// 2. キーワード検索で上位を抽出
// 3. mock or 実LLMで出典付き回答を生成
// 4. 推論と事実を分けて提示。参照元がなければ断定しない。
// =====================================================================

function toCitation(doc: SearchDoc): AiCitation {
  return {
    entityType: doc.entityType,
    entityId: doc.id,
    title: doc.title,
    confidenceLevel: doc.confidenceLevel,
    certaintyLevel: doc.certaintyLevel,
    isInternal: doc.isInternal,
    sourceObtainedAt: doc.sourceObtainedAt,
    lastVerifiedAt: doc.lastVerifiedAt,
    sourceUrl: doc.sourceUrl,
    snippet: doc.text.slice(0, 160),
  };
}

export async function ask(user: SafeUser, question: string): Promise<AiAnswer> {
  const hits = search(user, question, { limit: 6 });
  const citations = hits.map((h) => toCitation(h.doc));
  const hasEnoughInfo = hits.length > 0 && (hits[0]?.score ?? 0) >= 3;

  if (!isMockMode()) {
    const context = hits
      .map(
        (h, i) =>
          `【資料${i + 1}】${h.doc.title}(${h.doc.isInternal ? "社内情報" : "外部情報"} / 信頼度${h.doc.confidenceLevel} / ${CERTAINTY_LABELS[h.doc.certaintyLevel]})\n${h.doc.text.slice(0, 600)}`,
      )
      .join("\n\n");
    const messages: ChatTurn[] = [
      {
        role: "system",
        content:
          "あなたはABENGERSの社内ナレッジAIです。以下の【資料】のみを根拠に、日本語で簡潔に回答してください。" +
          "資料にない内容は断定せず、推論は『(推論)』と明示し、情報が不足する場合はその旨を述べてください。",
      },
      { role: "user", content: `質問: ${question}\n\n${context || "(該当資料なし)"}` },
    ];
    const { text, isMock } = await complete(messages);
    if (!isMock && text) {
      return { answer: text, citations, hasEnoughInfo, isMock: false };
    }
  }

  return { ...composeMockAnswer(question, hits.map((h) => h.doc), hasEnoughInfo), citations };
}

// --- モック回答生成(APIキー不要のRAGデモ) --------------------------
function composeMockAnswer(
  question: string,
  docs: SearchDoc[],
  hasEnoughInfo: boolean,
): Omit<AiAnswer, "citations"> {
  if (docs.length === 0) {
    return {
      answer:
        "登録済みの社内・承認済み外部情報の中に、この質問に直接該当する情報が見つかりませんでした。\n" +
        "情報が不足しているため、断定的な回答は行いません。関連資料を登録・承認するか、質問の言い換えをお試しください。",
      reasoningNote: "参照可能なドキュメントが0件のため、推論による補完は行っていません。",
      hasEnoughInfo: false,
      isMock: true,
    };
  }

  const lines: string[] = [];
  lines.push(`ご質問「${question}」について、登録情報を根拠に整理します。\n`);

  docs.slice(0, 4).forEach((d, i) => {
    const origin = d.isInternal ? "社内情報" : "外部情報";
    const trust = `信頼度${d.confidenceLevel}・${CERTAINTY_LABELS[d.certaintyLevel]}`;
    lines.push(`${i + 1}. **${d.title}**(${origin} / ${trust})`);
    lines.push(`   ${d.text.slice(0, 120)}…`);
  });

  const lowTrust = docs.filter((d) => d.certaintyLevel === "hypothesis" || d.certaintyLevel === "needs_check");
  lines.push("");
  if (lowTrust.length) {
    lines.push(
      `> ⚠ 上記のうち「${lowTrust.map((d) => d.title).join("、")}」は仮説・要確認の情報です。断定はできません。`,
    );
  }
  lines.push(
    "> (推論)これらの情報を総合すると、ABENGERSの共同経営モデルは「経営・実行・人材・資金を一体で担い、成果と利益を顧客と共有する」点が差別化要素と考えられます。この一文はAIによる推論です。",
  );

  return {
    answer: lines.join("\n"),
    reasoningNote:
      "本回答は登録済みドキュメントのキーワード一致に基づくモック生成です(AI_PROVIDER=mock)。" +
      "『(推論)』と付した箇所以外は、参照資料の記載範囲に限定しています。",
    hasEnoughInfo,
    isMock: true,
  };
}

export const AI_TRUST_LEGEND = { CONFIDENCE_LABELS, CERTAINTY_LABELS };
