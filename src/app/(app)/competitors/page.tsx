import { Swords } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStores, getStore, getCompetitorsByStore } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterSelect } from "@/components/ui/filter-select";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Competitor } from "@/types";

const THREAT: Record<1 | 2 | 3, { label: string; tone: BadgeTone }> = {
  1: { label: "低", tone: "muted" },
  2: { label: "中", tone: "warning" },
  3: { label: "高", tone: "danger" },
};

function rating(value: number | undefined): string {
  if (value === undefined) return "—";
  return `${value.toFixed(1)} ★`;
}

export default async function CompetitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const stores = await getStores();
  const storeId = sp.store ?? "store_hikari";
  const [store, comps] = await Promise.all([
    getStore(storeId),
    getCompetitorsByStore(storeId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="競合分析"
        description="自店舗と近隣競合を横並びで比較し、競合比較表を自動生成します。"
      >
        <FilterSelect
          param="store"
          options={stores.map((s) => ({ value: s.id, label: s.name }))}
          allLabel="店舗を選択"
        />
      </PageHeader>

      {store && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">自店舗</p>
              <p className="text-base font-semibold text-navy-800">{store.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">客単価</p>
              <p className="text-sm font-medium text-navy-800">{formatCurrency(store.avgSpend)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">業態</p>
              <p className="text-sm font-medium text-navy-800">{store.businessType}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {comps.length === 0 ? (
        <EmptyState
          title="競合データがありません"
          description="この店舗の競合はまだ登録されていません。"
        />
      ) : (
        <>
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Swords className="h-5 w-5 text-navy-500" />
              <CardTitle>競合比較表</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <THead>
                  <TR>
                    <TH>競合店舗名</TH>
                    <TH className="text-right">距離(km)</TH>
                    <TH>業態</TH>
                    <TH>ターゲット</TH>
                    <TH>価格帯</TH>
                    <TH className="text-right">客単価</TH>
                    <TH>看板商品</TH>
                    <TH>Google評価</TH>
                    <TH className="text-right">口コミ件数</TH>
                    <TH className="text-right">SNSフォロワー</TH>
                    <TH>投稿頻度</TH>
                    <TH>脅威度</TH>
                  </TR>
                </THead>
                <TBody>
                  {comps.map((c: Competitor) => {
                    const t = THREAT[c.threatLevel];
                    return (
                      <TR key={c.id}>
                        <TD className="font-medium text-navy-800">
                          {c.url ? (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-navy-700 hover:text-gold-600 hover:underline"
                            >
                              {c.name}
                            </a>
                          ) : (
                            c.name
                          )}
                        </TD>
                        <TD className="text-right">{c.distanceKm ?? "—"}</TD>
                        <TD>{c.businessType ?? "—"}</TD>
                        <TD>{c.target ?? "—"}</TD>
                        <TD className="whitespace-nowrap">{c.priceRange ?? "—"}</TD>
                        <TD className="text-right">{formatCurrency(c.avgSpend)}</TD>
                        <TD>{c.signatureProduct ?? "—"}</TD>
                        <TD className="whitespace-nowrap">{rating(c.googleRating)}</TD>
                        <TD className="text-right">{formatNumber(c.reviewCount)}</TD>
                        <TD className="text-right">{formatNumber(c.snsFollowers)}</TD>
                        <TD>{c.postFrequency ?? "—"}</TD>
                        <TD>
                          <Badge tone={t.tone}>{t.label}</Badge>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {comps.map((c) => (
              <Card key={c.id}>
                <CardHeader className="flex-row items-center justify-between gap-2">
                  <CardTitle className="text-sm">{c.name}</CardTitle>
                  <Badge tone={THREAT[c.threatLevel].tone}>脅威度 {THREAT[c.threatLevel].label}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-success">強み</p>
                    <p className="mt-0.5 text-sm text-navy-800">{c.strengths ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-danger">弱み</p>
                    <p className="mt-0.5 text-sm text-navy-800">{c.weaknesses ?? "—"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
