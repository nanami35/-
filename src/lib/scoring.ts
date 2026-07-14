import { DIAGNOSIS_CATEGORIES } from "@/lib/constants";
import type { DiagnosisScore } from "@/types";

export interface CategoryResult {
  key: string;
  label: string;
  /** 100点換算スコア */
  score: number;
  /** 5段階の平均 */
  average: number;
  itemCount: number;
}

export interface DiagnosisResult {
  categories: CategoryResult[];
  /** 5カテゴリ平均の100点換算 */
  total: number;
}

/**
 * 5段階(1-5)の項目スコアから、カテゴリ別および総合スコアを算出する。
 * 各カテゴリ = 項目平均 / 5 * 100。総合 = カテゴリスコアの単純平均。
 */
export function computeDiagnosis(scores: DiagnosisScore[]): DiagnosisResult {
  const categories: CategoryResult[] = DIAGNOSIS_CATEGORIES.map((cat) => {
    const items = scores.filter((s) => s.categoryKey === cat.key);
    const valid = items.filter((s) => s.score > 0);
    const average =
      valid.length > 0
        ? valid.reduce((sum, s) => sum + s.score, 0) / valid.length
        : 0;
    return {
      key: cat.key,
      label: cat.label,
      score: Math.round((average / 5) * 100),
      average: Number(average.toFixed(2)),
      itemCount: valid.length,
    };
  });

  const scored = categories.filter((c) => c.itemCount > 0);
  const total =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, c) => sum + c.score, 0) / scored.length
        )
      : 0;

  return { categories, total };
}
