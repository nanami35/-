import type { ComparisonMatrix, ScoreSymbol } from "@/lib/types";
import { ABENGERS_ORG } from "./helpers";

// 比較マトリクス初期データ(要件 8-8 / 17)
// 対象: 経営コンサル / ハンズオンVC / CXO派遣 / ベンチャーリンク / ABENGERS / コエニ
// 各評価には根拠(note)を紐づける。

const targets = [
  { id: "t-consulting", label: "経営コンサル会社" },
  { id: "t-vc", label: "ハンズオンVC" },
  { id: "t-cxo", label: "CXO派遣会社" },
  { id: "t-venturelink", label: "ベンチャー・リンク" },
  { id: "t-abengers", label: "ABENGERS" },
  { id: "t-koeni", label: "コエニ" },
];

const itemLabels = [
  "経営戦略策定",
  "現場実行支援",
  "経営責任",
  "出資",
  "株式保有",
  "CXO派遣",
  "経営受託",
  "マーケティング実行",
  "FC本部構築",
  "加盟開発",
  "採用支援",
  "人材育成",
  "共同経営",
  "株式価値向上",
  "EXIT収益",
  "支援後の内製化",
  "事業の連続創出",
  "顧客との利益共有",
  "主な収益源",
  "主なリスク",
];

const items = itemLabels.map((label, i) => ({ id: `ci-${i}`, label, order: i }));

// 評価マトリクス。列 = targets の順、行 = items の順。
// D=◎ O=○ T=△ X=× N=対象外 U=不明、末尾に主な収益源/リスクはテキスト。
type Sym = "D" | "O" | "T" | "X" | "N" | "U";
const grid: Record<string, Sym[]> = {
  経営戦略策定: ["D", "O", "T", "O", "D", "T"],
  現場実行支援: ["T", "O", "O", "D", "D", "D"],
  経営責任: ["X", "T", "T", "T", "D", "T"],
  出資: ["X", "D", "X", "O", "D", "X"],
  株式保有: ["X", "D", "X", "T", "D", "X"],
  CXO派遣: ["T", "T", "D", "T", "D", "X"],
  経営受託: ["X", "X", "T", "T", "D", "T"],
  マーケティング実行: ["T", "T", "T", "O", "O", "D"],
  FC本部構築: ["O", "X", "X", "D", "D", "T"],
  加盟開発: ["T", "X", "X", "D", "O", "T"],
  採用支援: ["T", "T", "O", "O", "D", "X"],
  人材育成: ["O", "T", "O", "D", "D", "T"],
  共同経営: ["X", "T", "X", "T", "D", "X"],
  株式価値向上: ["T", "D", "X", "O", "D", "T"],
  EXIT収益: ["X", "D", "X", "O", "O", "X"],
  支援後の内製化: ["T", "T", "O", "T", "D", "O"],
  事業の連続創出: ["X", "T", "X", "O", "D", "T"],
  顧客との利益共有: ["T", "O", "T", "X", "D", "O"],
};

const revenueRow: Record<string, string> = {
  経営コンサル会社: "顧問・PJフィー",
  ハンズオンVC: "キャピタルゲイン",
  CXO派遣会社: "人材稼働フィー",
  "ベンチャー・リンク": "加盟金・ロイヤリティ・出資EXIT",
  ABENGERS: "受託+成果報酬+株式価値",
  コエニ: "マーケ支援+成果連動",
};
const riskRow: Record<string, string> = {
  経営コンサル会社: "実行が顧客依存",
  ハンズオンVC: "投資回収の不確実性",
  CXO派遣会社: "人材品質のばらつき",
  "ベンチャー・リンク": "短期KPI暴走・加盟店軽視",
  ABENGERS: "経営資源の集中",
  コエニ: "媒体変化",
};

const SYM: Record<Sym, ScoreSymbol> = {
  D: "double_circle",
  O: "circle",
  T: "triangle",
  X: "cross",
  N: "n/a",
  U: "unknown",
};

const noteFor: Record<Sym, string> = {
  D: "中核として強く担う",
  O: "担う",
  T: "限定的・部分的に担う",
  X: "担わない",
  N: "対象外",
  U: "情報不足のため要確認",
};

const scores = [] as ComparisonMatrix["scores"];
items.forEach((item) => {
  targets.forEach((t, ti) => {
    if (item.label === "主な収益源") {
      scores.push({ targetId: t.id, itemId: item.id, symbol: "n/a", note: revenueRow[t.label] });
    } else if (item.label === "主なリスク") {
      scores.push({ targetId: t.id, itemId: item.id, symbol: "n/a", note: riskRow[t.label] });
    } else {
      const row = grid[item.label];
      const sym = row ? (row[ti] ?? "U") : "U";
      scores.push({
        targetId: t.id,
        itemId: item.id,
        symbol: SYM[sym],
        note: noteFor[sym],
        source: t.id === "t-abengers" || t.id === "t-koeni" ? "指示書 第4章" : "業界研究(要確認)",
      });
    }
  });
});

export const comparisonMatrices: ComparisonMatrix[] = [
  {
    id: "cmp-core",
    organizationId: ABENGERS_ORG,
    name: "支援モデル比較(コンサル/VC/CXO/ベンチャーリンク/ABENGERS/コエニ)",
    description:
      "ABENGERSとコエニは指示書の定義を反映。その他は業界研究に基づく仮説であり要確認。",
    targetKind: "company",
    targetIds: targets.map((t) => t.id),
    items,
    scores,
    createdAt: "2026-06-15T00:00:00Z",
    createdBy: "user-hori",
  },
];

export const comparisonTargetLabels: Record<string, string> = Object.fromEntries(
  targets.map((t) => [t.id, t.label]),
);
