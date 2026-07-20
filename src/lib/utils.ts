import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind クラスを安全に結合する */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 金額を日本円表記に整形する（例: 3000000 -> ¥3,000,000） */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

/** 数値を桁区切りで整形する */
export function formatNumber(
  value: number | null | undefined,
  unit = ""
): string {
  if (value === null || value === undefined) return "—";
  return `${value.toLocaleString("ja-JP")}${unit}`;
}

/** 割合(%)を整形する（value は 0-100 想定） */
export function formatPercent(
  value: number | null | undefined,
  digits = 1
): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(digits)}%`;
}

/** YYYY-MM-DD / ISO 文字列を「2026年7月14日」形式へ */
export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** YYYY-MM 形式へ */
export function formatMonth(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

/** 前月比などの増減率を計算する（%） */
export function changeRate(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

/** 達成率を計算する（%） */
export function achievementRate(
  actual: number,
  target: number
): number | null {
  if (!target) return null;
  return (actual / target) * 100;
}

/** 期限が超過しているか */
export function isOverdue(due: string | null | undefined): boolean {
  if (!due) return false;
  const d = new Date(due);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

/** 配列を key ごとにグループ化する */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      (acc[key] ??= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}
