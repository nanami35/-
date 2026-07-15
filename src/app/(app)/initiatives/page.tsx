import Link from "next/link";
import { Plus, Rocket } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getInitiatives, getStoreMap, getStores, getUserMap } from "@/lib/data";
import {
  INITIATIVE_CATEGORIES,
  INITIATIVE_STATUS,
  KPI_DEFINITIONS,
  type InitiativeStatus,
} from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InitiativeStatusBadge } from "@/components/status-badge";
import { achievementRate, formatDate, formatNumber } from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(INITIATIVE_STATUS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_OPTIONS = INITIATIVE_CATEGORIES.map((c) => ({ value: c, label: c }));

function kpiLabel(key?: string): string {
  if (!key) return "—";
  return KPI_DEFINITIONS.find((d) => d.key === key)?.label ?? key;
}

export default async function InitiativesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    store?: string;
    status?: string;
    category?: string;
  }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const store = sp.store ?? "";
  const status = sp.status ?? "";
  const category = sp.category ?? "";

  let initiatives = await getInitiatives();
  if (store) initiatives = initiatives.filter((i) => i.storeId === store);
  if (status)
    initiatives = initiatives.filter((i) => i.status === (status as InitiativeStatus));
  if (category) initiatives = initiatives.filter((i) => i.category === category);
  if (q) initiatives = initiatives.filter((i) => i.name.toLowerCase().includes(q));

  const [stores, storeMap, userMap] = await Promise.all([
    getStores(),
    getStoreMap(),
    getUserMap(),
  ]);
  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="施策"
        description="実施中・計画中の施策と成果を管理します。"
      >
        <Button variant="gold">
          <Plus className="h-4 w-4" />
          新規施策
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="施策名で検索..." />
        <FilterSelect param="store" options={storeOptions} allLabel="すべての店舗" />
        <FilterSelect param="category" options={CATEGORY_OPTIONS} allLabel="すべてのカテゴリ" />
        <FilterSelect param="status" options={STATUS_OPTIONS} allLabel="すべてのステータス" />
        <span className="ml-auto text-sm text-muted-foreground">{initiatives.length}件</span>
      </div>

      {initiatives.length === 0 ? (
        <EmptyState
          title="施策が見つかりません"
          description="検索条件を変更するか、新しい施策を登録してください。"
          icon={<Rocket className="h-6 w-6" />}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>施策名</TH>
                  <TH>店舗</TH>
                  <TH>カテゴリ</TH>
                  <TH>KPI</TH>
                  <TH className="text-right">目標値</TH>
                  <TH className="text-right">実績値</TH>
                  <TH>進捗</TH>
                  <TH>ステータス</TH>
                  <TH>担当</TH>
                  <TH>期間</TH>
                </TR>
              </THead>
              <TBody>
                {initiatives.map((i) => {
                  const progress =
                    i.actualValue != null && i.targetValue != null
                      ? achievementRate(i.actualValue, i.targetValue) ?? 0
                      : 0;
                  return (
                    <TR key={i.id}>
                      <TD>
                        <Link
                          href={`/initiatives/${i.id}`}
                          className="font-medium text-navy-700 hover:text-gold-600 hover:underline"
                        >
                          {i.name}
                        </Link>
                      </TD>
                      <TD className="text-sm">{storeMap.get(i.storeId)?.name ?? "—"}</TD>
                      <TD>
                        <Badge tone="navy">{i.category}</Badge>
                      </TD>
                      <TD className="text-sm">{kpiLabel(i.kpiKey)}</TD>
                      <TD className="text-right text-sm">{formatNumber(i.targetValue)}</TD>
                      <TD className="text-right text-sm">{formatNumber(i.actualValue)}</TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={progress}
                            tone={progress >= 100 ? "success" : progress >= 60 ? "gold" : "warning"}
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </TD>
                      <TD>
                        <InitiativeStatusBadge value={i.status} />
                      </TD>
                      <TD className="text-sm">{userMap.get(i.assigneeId ?? "")?.name ?? "未割当"}</TD>
                      <TD className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(i.startDate)}〜{formatDate(i.endDate)}
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
