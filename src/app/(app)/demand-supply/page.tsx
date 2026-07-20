import { Scale } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStores, getStore } from "@/lib/data";
import { VALUE_AXES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Badge, type BadgeTone } from "@/components/ui/badge";

type GapLevel = "match" | "partial" | "mismatch";

const GAP_META: Record<GapLevel, { label: string; tone: BadgeTone }> = {
  match: { label: "一致", tone: "success" },
  partial: { label: "一部不一致", tone: "warning" },
  mismatch: { label: "不一致", tone: "danger" },
};

interface AxisEntry {
  demand: string;
  supply: string;
  gap: string;
  level: GapLevel;
}

/**
 * 需要・供給の永続レコードはサンプルデータに存在しないため、
 * store_hikari 向けにフレームワークの見え方を示す例示データを用意する。
 * Phase 2 で demand_analyses / supply_analyses として編集可能なレコードになる想定。
 */
const ILLUSTRATIVE: Record<string, Record<string, AxisEntry>> = {
  store_hikari: {
    product: {
      demand: "写真映えする限定メニュー・質の高いコーヒー",
      supply: "コーヒーの品質は高いが、看板商品の訴求が弱い",
      gap: "看板商品（北欧シナモンロール）の認知確立が必要",
      level: "partial",
    },
    service: {
      demand: "落ち着いた雰囲気を壊さない、程よい距離感の接客",
      supply: "スタッフの丁寧さは評価が高く、期待に応えられている",
      gap: "接客品質の均一化（時間帯・担当者による差の解消）",
      level: "match",
    },
    atmosphere: {
      demand: "作業・長居ができる落ち着いた居心地の良い空間",
      supply: "内装・BGM・席の快適性は好評で強みになっている",
      gap: "混雑時の回転と滞在ニーズの両立",
      level: "match",
    },
    image: {
      demand: "日常に使える上質さ、統一感のある世界観",
      supply: "SNSの世界観に統一感が乏しく、ブランドが伝わりにくい",
      gap: "コンセプトの言語化とSNS・メニュー表への一貫反映",
      level: "mismatch",
    },
    experience: {
      demand: "来店前の期待から退店後の余韻まで、話題にしたくなる体験",
      supply: "実際の体験満足は高いが、来店前の期待醸成が弱い",
      gap: "来店動機を生むSNS導線と、再来店を促す仕掛けの設計",
      level: "partial",
    },
  },
};

export default async function DemandSupplyPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const stores = await getStores();
  const storeId = sp.store ?? "store_hikari";
  const store = await getStore(storeId);
  const entries = ILLUSTRATIVE[storeId];

  return (
    <div className="space-y-6">
      <PageHeader
        title="需要・供給分析"
        description="顧客の需要と店舗の供給を5つの価値で整理し、ギャップを可視化します。"
      >
        <FilterSelect
          param="store"
          options={stores.map((s) => ({ value: s.id, label: s.name }))}
          allLabel="店舗を選択"
        />
      </PageHeader>

      <Card>
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-navy-500" />
            <p className="font-medium text-navy-800">5つの価値でギャップを可視化</p>
          </div>
          <CardDescription>
            顧客が求める価値（需要側）と、店舗が提供できている価値（供給側）を突き合わせ、
            埋めるべきギャップを特定します。これらは Phase 2 で編集可能なレコード
            （demand_analyses / supply_analyses）になる予定です。
          </CardDescription>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {VALUE_AXES.map((axis) => {
          const entry = entries?.[axis.key];
          return (
            <Card key={axis.key}>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle>{axis.label}</CardTitle>
                {entry ? (
                  <Badge tone={GAP_META[entry.level].tone}>{GAP_META[entry.level].label}</Badge>
                ) : (
                  <Badge tone="muted">未入力</Badge>
                )}
              </CardHeader>
              <CardContent>
                {entry ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-navy-50/40 p-3">
                      <p className="text-xs font-medium text-navy-600">需要側（顧客が求める価値）</p>
                      <p className="mt-1 text-sm text-navy-800">{entry.demand}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-navy-50/40 p-3">
                      <p className="text-xs font-medium text-navy-600">供給側（店舗が提供できている価値）</p>
                      <p className="mt-1 text-sm text-navy-800">{entry.supply}</p>
                    </div>
                    <div className="rounded-lg border border-gold-200 bg-gold-50/60 p-3">
                      <p className="text-xs font-medium text-gold-700">ギャップ</p>
                      <p className="mt-1 text-sm text-navy-800">{entry.gap}</p>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    この価値軸の需要・供給はまだ入力されていません。
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!store && (
        <p className="text-sm text-muted-foreground">有効な店舗を選択してください。</p>
      )}
    </div>
  );
}
