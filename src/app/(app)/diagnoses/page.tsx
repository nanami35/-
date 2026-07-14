import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDiagnoses, getStores, getStore, getUserName } from "@/lib/data";
import { computeDiagnosis } from "@/lib/scoring";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";

/** 総合点に応じた Progress の色味 */
function scoreTone(total: number): "success" | "gold" | "warning" {
  if (total >= 80) return "success";
  if (total >= 60) return "gold";
  return "warning";
}

/** ラベルから「価値」を除いた短縮表記（商品価値 → 商品） */
function shortLabel(label: string): string {
  return label.replace("価値", "");
}

export default async function DiagnosesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const storeFilter = sp.store ?? "";

  let diagnoses = getDiagnoses();
  if (storeFilter) diagnoses = diagnoses.filter((d) => d.storeId === storeFilter);

  const storeOptions = getStores()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
    .map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="店舗診断"
        description="5つの価値（商品・接客・雰囲気・イメージ・体験）で店舗を評価します。"
      >
        <Button variant="gold">
          <Plus className="h-4 w-4" />
          新規診断
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect param="store" options={storeOptions} allLabel="すべての店舗" />
        <span className="ml-auto text-sm text-muted-foreground">{diagnoses.length}件</span>
      </div>

      {diagnoses.length === 0 ? (
        <EmptyState
          title="診断がありません"
          description="検索条件を変更するか、新しい店舗診断を実施してください。"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>店舗名</TH>
                  <TH>実施日</TH>
                  <TH>評価者</TH>
                  <TH>総合点</TH>
                  <TH>5つの価値の内訳</TH>
                </TR>
              </THead>
              <TBody>
                {diagnoses.map((d) => {
                  const result = computeDiagnosis(d.scores);
                  return (
                    <TR key={d.id}>
                      <TD>
                        <Link
                          href={`/diagnoses/${d.id}`}
                          className="font-medium text-navy-700 hover:text-gold-600 hover:underline"
                        >
                          {getStore(d.storeId)?.name ?? "—"}
                        </Link>
                      </TD>
                      <TD className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(d.date)}
                      </TD>
                      <TD>{getUserName(d.evaluatorId)}</TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-navy-800">{result.total}</span>
                          <span className="text-xs text-muted-foreground">/100</span>
                          <Progress
                            value={result.total}
                            tone={scoreTone(result.total)}
                            className="w-16"
                          />
                        </div>
                      </TD>
                      <TD>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {result.categories.map((c) => (
                            <span key={c.key} className="text-xs text-navy-700">
                              <span className="text-muted-foreground">{shortLabel(c.label)}</span>{" "}
                              <span className="font-semibold">{c.score}</span>
                            </span>
                          ))}
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
