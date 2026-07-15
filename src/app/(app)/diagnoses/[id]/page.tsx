import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getDiagnosis,
  getDiagnosesByStore,
  getStore,
  getClient,
  getUserName,
} from "@/lib/data";
import { computeDiagnosis } from "@/lib/scoring";
import { DIAGNOSIS_CATEGORIES, SCORE_LEVELS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PriorityBadge } from "@/components/status-badge";
import { DiagnosisRadar, type RadarSeries } from "@/components/charts/diagnosis-radar";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { formatDate, formatMonth } from "@/lib/utils";
import type { Diagnosis } from "@/types";

const NAVY = "#1A2B4A";
const GOLD = "#C9A227";

/** 1-5 の点数を ●●●○○ 形式で表す */
function scoreDots(score: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(score)));
  return "●".repeat(filled) + "○".repeat(5 - filled);
}

/** 診断のカテゴリ別 100点換算スコアを key→score のマップにする */
function categoryScoreMap(diag: Diagnosis): Record<string, number> {
  return Object.fromEntries(
    computeDiagnosis(diag.scores).categories.map((c) => [c.key, c.score])
  );
}

export default async function DiagnosisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const diag = await getDiagnosis(id);
  if (!diag) notFound();

  const store = await getStore(diag.storeId);
  const clientName = store ? (await getClient(store.clientId))?.name : undefined;
  const evaluatorName = await getUserName(diag.evaluatorId);

  const history = await getDiagnosesByStore(diag.storeId);
  const prev = history.find((h) => h.id !== diag.id && h.date < diag.date);

  const result = computeDiagnosis(diag.scores);
  const currentMap = categoryScoreMap(diag);

  const series: RadarSeries[] = [
    { name: `今回（${formatMonth(diag.date)}）`, color: NAVY, values: currentMap },
  ];
  if (prev) {
    series.push({
      name: `前回（${formatMonth(prev.date)}）`,
      color: GOLD,
      values: categoryScoreMap(prev),
    });
  }

  const barData = result.categories.map((c) => ({ name: c.label, value: c.score }));

  return (
    <div className="space-y-6">
      <Link
        href="/diagnoses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy-700"
      >
        <ArrowLeft className="h-4 w-4" />
        店舗診断一覧に戻る
      </Link>

      <PageHeader
        title={store?.name ?? "店舗不明"}
        description={clientName ? `${clientName} の店舗診断` : "店舗診断"}
      >
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">実施日</p>
            <p className="text-sm font-medium text-navy-800">{formatDate(diag.date)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">評価者</p>
            <p className="text-sm font-medium text-navy-800">{evaluatorName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">総合点</p>
            <p className="text-2xl font-bold text-navy-800">
              {result.total}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </div>
        </div>
      </PageHeader>

      {store && (
        <Link
          href={`/stores/${store.id}`}
          className="inline-flex text-sm text-navy-600 hover:text-gold-600 hover:underline"
        >
          店舗詳細を見る
        </Link>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>5つの価値バランス</CardTitle>
          </CardHeader>
          <CardContent>
            <DiagnosisRadar
              categories={DIAGNOSIS_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
              series={series}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別スコア</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={barData} domain={[0, 100]} color={NAVY} />
          </CardContent>
        </Card>
      </div>

      {diag.summary && (
        <Card>
          <CardHeader>
            <CardTitle>総評</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-800">
              {diag.summary}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {DIAGNOSIS_CATEGORIES.map((cat) => {
          const items = diag.scores.filter((s) => s.categoryKey === cat.key);
          const catScore = currentMap[cat.key] ?? 0;
          return (
            <Card key={cat.key}>
              <CardHeader>
                <CardTitle>
                  {cat.label}（{catScore}点）
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <THead>
                    <TR>
                      <TH>項目</TH>
                      <TH>点数</TH>
                      <TH>コメント</TH>
                      <TH>課題</TH>
                      <TH>改善案</TH>
                      <TH>優先順位</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((item, i) => {
                      const level = SCORE_LEVELS.find((l) => l.value === Math.round(item.score));
                      return (
                        <TR key={i}>
                          <TD className="whitespace-nowrap font-medium text-navy-800">
                            {item.itemLabel}
                          </TD>
                          <TD className="whitespace-nowrap">
                            <span className="tracking-tight text-gold-500">
                              {scoreDots(item.score)}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {item.score} / 5{level ? `・${level.label}` : ""}
                            </span>
                          </TD>
                          <TD className="min-w-40 text-sm text-navy-700">
                            {item.comment ?? <span className="text-muted-foreground">—</span>}
                          </TD>
                          <TD className="min-w-40 text-sm text-navy-700">
                            {item.issue ?? <span className="text-muted-foreground">—</span>}
                          </TD>
                          <TD className="min-w-40 text-sm text-navy-700">
                            {item.improvement ?? <span className="text-muted-foreground">—</span>}
                          </TD>
                          <TD>
                            {item.priority ? (
                              <PriorityBadge value={item.priority} />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
