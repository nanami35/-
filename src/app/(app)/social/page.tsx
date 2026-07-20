import { Instagram } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSocialContents, getUserMap } from "@/lib/data";
import { SOCIAL_PLATFORMS, SOCIAL_STATUS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterSelect } from "@/components/ui/filter-select";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { SocialStatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import type { SocialContent } from "@/types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;
// 2026年7月：1日は水曜、31日まで
const JULY_LEADING_BLANKS = 3;
const JULY_DAYS = 31;

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; platform?: string; status?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const view = sp.view ?? "list";

  let contents = await getSocialContents();
  if (sp.platform) contents = contents.filter((c) => c.platform === sp.platform);
  if (sp.status) contents = contents.filter((c) => c.status === sp.status);

  const userMap = await getUserMap();

  // カレンダー用：投稿日ごとにグルーピング（2026年7月）
  const byDay = new Map<number, SocialContent[]>();
  for (const c of contents) {
    if (!c.postDate) continue;
    const d = new Date(c.postDate);
    if (d.getFullYear() === 2026 && d.getMonth() === 6) {
      const day = d.getDate();
      const list = byDay.get(day) ?? [];
      list.push(c);
      byDay.set(day, list);
    }
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: JULY_LEADING_BLANKS }, () => null),
    ...Array.from({ length: JULY_DAYS }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SNSコンテンツ管理"
        description="企画から分析までのコンテンツ制作パイプラインを一覧・カレンダーで管理します。"
      >
        <FilterSelect
          param="platform"
          options={SOCIAL_PLATFORMS.map((p) => ({ value: p, label: p }))}
          allLabel="全媒体"
        />
        <FilterSelect
          param="status"
          options={Object.entries(SOCIAL_STATUS).map(([value, label]) => ({ value, label }))}
          allLabel="全ステータス"
        />
      </PageHeader>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <span className="text-xs font-medium text-muted-foreground">ステータスの流れ</span>
          {Object.entries(SOCIAL_STATUS).map(([key, label], i, arr) => (
            <span key={key} className="flex items-center gap-2">
              <SocialStatusBadge value={key as keyof typeof SOCIAL_STATUS} />
              {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </CardContent>
      </Card>

      <Tabs
        param="view"
        defaultValue="list"
        items={[
          { value: "list", label: "一覧" },
          { value: "calendar", label: "カレンダー" },
        ]}
      />

      {view === "calendar" ? (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Instagram className="h-5 w-5 text-navy-500" />
            <CardTitle>2026年7月</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="bg-navy-50 py-2 text-center text-xs font-semibold text-navy-600"
                >
                  {w}
                </div>
              ))}
              {cells.map((day, i) => (
                <div key={i} className="min-h-24 bg-card p-1.5">
                  {day !== null && (
                    <>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">{day}</p>
                      <div className="space-y-1">
                        {(byDay.get(day) ?? []).map((c) => (
                          <div
                            key={c.id}
                            className="rounded bg-gold-50 px-1.5 py-1 text-[11px] leading-tight text-navy-800"
                            title={c.theme}
                          >
                            <span className="font-medium">{c.platform}</span>
                            <span className="block truncate text-muted-foreground">{c.theme}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : contents.length === 0 ? (
        <EmptyState
          title="コンテンツがありません"
          description="条件に合致するSNSコンテンツがありません。"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>投稿媒体</TH>
                  <TH>投稿テーマ</TH>
                  <TH>投稿形式</TH>
                  <TH>担当</TH>
                  <TH>投稿日</TH>
                  <TH>ステータス</TH>
                  <TH>投稿URL</TH>
                </TR>
              </THead>
              <TBody>
                {contents.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <Badge tone="navy">{c.platform}</Badge>
                    </TD>
                    <TD className="font-medium text-navy-800">{c.theme}</TD>
                    <TD>{c.format ?? "—"}</TD>
                    <TD>{(c.assigneeId ? userMap.get(c.assigneeId) : undefined)?.name ?? "未割当"}</TD>
                    <TD className="whitespace-nowrap">{formatDate(c.postDate)}</TD>
                    <TD>
                      <SocialStatusBadge value={c.status} />
                    </TD>
                    <TD>
                      {c.postUrl ? (
                        <a
                          href={c.postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-navy-700 hover:text-gold-600 hover:underline"
                        >
                          リンク
                        </a>
                      ) : (
                        "—"
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
