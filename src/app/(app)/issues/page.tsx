import { AlertTriangle, Info } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getIssues, getStoreMap, getStores, getUserMap, priorityScore } from "@/lib/data";
import {
  ISSUE_CATEGORIES,
  ISSUE_STATUS,
  IMPACT_LEVELS,
  type IssueStatus,
} from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IssueStatusBadge } from "@/components/status-badge";
import { formatDate, isOverdue } from "@/lib/utils";

const STORE_NONE = "—";

const STATUS_OPTIONS = Object.entries(ISSUE_STATUS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_OPTIONS = ISSUE_CATEGORIES.map((c) => ({ value: c, label: c }));

/** 1=低, 2=中, 3=高 のラベルを返す */
function levelLabel(value: number): string {
  return IMPACT_LEVELS.find((l) => l.value === value)?.label ?? String(value);
}

export default async function IssuesPage({
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

  let issues = await getIssues();
  if (store) issues = issues.filter((i) => i.storeId === store);
  if (status) issues = issues.filter((i) => i.status === (status as IssueStatus));
  if (category) issues = issues.filter((i) => i.category === category);
  if (q) issues = issues.filter((i) => i.title.toLowerCase().includes(q));

  const ranked = issues
    .map((i) => ({ issue: i, score: priorityScore(i) }))
    .sort((a, b) => b.score - a.score);

  const [stores, storeMap, userMap] = await Promise.all([
    getStores(),
    getStoreMap(),
    getUserMap(),
  ]);
  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="課題"
        description="店舗の課題を優先順位付けして管理します。"
      />

      <Card className="border-navy-200 bg-navy-50/60">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-navy-500" />
          <p className="text-sm text-navy-700">
            優先順位 = 影響度 × 緊急度 ×（4 − 改善難易度）で自動算出しています。
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="課題名で検索..." />
        <FilterSelect param="store" options={storeOptions} allLabel="すべての店舗" />
        <FilterSelect param="status" options={STATUS_OPTIONS} allLabel="すべてのステータス" />
        <FilterSelect param="category" options={CATEGORY_OPTIONS} allLabel="すべてのカテゴリ" />
        <span className="ml-auto text-sm text-muted-foreground">{ranked.length}件</span>
      </div>

      {ranked.length === 0 ? (
        <EmptyState
          title="課題が見つかりません"
          description="検索条件を変更してください。"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>優先度</TH>
                  <TH>課題名</TH>
                  <TH>店舗</TH>
                  <TH>カテゴリ</TH>
                  <TH className="text-center">影響度</TH>
                  <TH className="text-center">緊急度</TH>
                  <TH className="text-center">難易度</TH>
                  <TH>ステータス</TH>
                  <TH>担当</TH>
                  <TH>期限</TH>
                </TR>
              </THead>
              <TBody>
                {ranked.map(({ issue, score }, index) => {
                  const rank = index + 1;
                  const tone = rank <= 3 ? "danger" : rank <= 6 ? "warning" : "muted";
                  const overdue =
                    isOverdue(issue.dueDate) && issue.status !== "resolved";
                  return (
                    <TR key={issue.id}>
                      <TD>
                        <div className="flex items-center gap-2">
                          <Badge tone={tone}>{rank}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {score}pt
                          </span>
                        </div>
                      </TD>
                      <TD className="font-medium text-navy-800">{issue.title}</TD>
                      <TD className="text-sm">
                        {storeMap.get(issue.storeId)?.name ?? STORE_NONE}
                      </TD>
                      <TD>
                        <Badge tone="navy">{issue.category}</Badge>
                      </TD>
                      <TD className="text-center text-sm">{levelLabel(issue.impact)}</TD>
                      <TD className="text-center text-sm">{levelLabel(issue.urgency)}</TD>
                      <TD className="text-center text-sm">
                        {levelLabel(issue.difficulty)}
                      </TD>
                      <TD>
                        <IssueStatusBadge value={issue.status} />
                      </TD>
                      <TD className="text-sm">{userMap.get(issue.assigneeId ?? "")?.name ?? "未割当"}</TD>
                      <TD
                        className={`whitespace-nowrap text-xs ${
                          overdue ? "font-semibold text-danger" : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(issue.dueDate)}
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
