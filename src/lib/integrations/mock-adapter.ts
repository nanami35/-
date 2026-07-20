/**
 * 汎用モックアダプタ。
 * 定義（INTEGRATION_DEFS）の base 値をもとに、店舗・月・指標から
 * 決定論的（乱数なし）に近似値を生成する。デモ・オフラインで動作。
 */
import type {
  IntegrationAdapter, IntegrationContext, IntegrationDefinition,
  MetricSnapshot, ReviewItem,
} from "@/lib/integrations/types";

/** djb2 ベースの決定論的ハッシュ → 0..1 */
function hash01(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  // 0..1 に正規化
  return ((h >>> 0) % 10000) / 10000;
}

function roundMetric(value: number, decimal?: boolean): number {
  if (decimal) return Math.round(value * 10) / 10;
  return Math.round(value);
}

const SAMPLE_REVIEWS: ReviewItem[] = [
  { author: "M. Tanaka", rating: 5, text: "コーヒーが本当に美味しい。落ち着いて作業できる雰囲気も最高です。", date: "2026-07-02" },
  { author: "yuki_cafe", rating: 4, text: "シナモンロールが絶品。平日の昼でも少し混んでいました。", date: "2026-06-28" },
  { author: "K. Sato", rating: 3, text: "味は良いが、提供までやや時間がかかった。", date: "2026-06-20" },
  { author: "haruka", rating: 5, text: "写真映えするパフェ。友人にも勧めたいお店です。", date: "2026-06-15" },
  { author: "T. Watanabe", rating: 2, text: "混雑時のスタッフ対応にばらつきを感じた。", date: "2026-06-10" },
];

export function createMockAdapter(def: IntegrationDefinition): IntegrationAdapter {
  return {
    provider: def.provider,
    definition: def,
    isLive: () => false,
    async fetchMetrics(ctx: IntegrationContext): Promise<MetricSnapshot> {
      const metrics = def.metrics.map((spec) => {
        // POS/売上系は店舗の実データを基準に
        let base = spec.base;
        if (def.provider === "pos") {
          if (spec.kpiKey === "sales" && ctx.store.monthlySales) base = ctx.store.monthlySales;
          if (spec.kpiKey === "customers" && ctx.store.monthlyCustomers) base = ctx.store.monthlyCustomers;
          if (spec.kpiKey === "avg_spend" && ctx.store.avgSpend) base = ctx.store.avgSpend;
        }
        const h = hash01(`${ctx.store.id}:${ctx.month}:${spec.kpiKey}`);
        // base の ±10% で変動
        const value = base * (0.9 + 0.2 * h);
        return { kpiKey: spec.kpiKey, value: roundMetric(value, spec.decimal) };
      });
      return { provider: def.provider, storeId: ctx.store.id, month: ctx.month, metrics };
    },
    fetchReviews: def.providesReviews
      ? async (): Promise<ReviewItem[]> => SAMPLE_REVIEWS
      : undefined,
  };
}
