import { Users, CalendarClock, Info, CheckSquare } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMeetings, getStore, getClient, getStores } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Meeting } from "@/types";

/** ISO 文字列から HH:MM を取り出す（"2026-06-22T14:00:00.000Z" -> "14:00"） */
function timeOf(datetime: string): string {
  const m = /T(\d{2}):(\d{2})/.exec(datetime);
  return m ? `${m[1]}:${m[2]}` : "";
}

/** 関連先ラベル（クライアント名 / 店舗名） */
function relatedLabels(m: Meeting): string[] {
  const labels: string[] = [];
  if (m.clientId) {
    const c = getClient(m.clientId);
    if (c) labels.push(c.name);
  }
  if (m.storeId) {
    const s = getStore(m.storeId);
    if (s) labels.push(s.name);
  }
  return labels;
}

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const store = sp.store ?? "";

  let meetings = getMeetings();
  if (store) meetings = meetings.filter((m) => m.storeId === store);
  if (q) meetings = meetings.filter((m) => (m.agenda ?? "").toLowerCase().includes(q));

  const storeOptions = getStores().map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="ミーティング"
        description="クライアントとのミーティング議事録を管理します。"
      />

      <Card className="border-navy-200 bg-navy-50/60">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-navy-500" />
          <p className="text-sm text-navy-700">議事録は時系列で閲覧できます。</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="議題で検索..." />
        <FilterSelect param="store" options={storeOptions} allLabel="すべての店舗" />
        <span className="ml-auto text-sm text-muted-foreground">{meetings.length}件</span>
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          title="ミーティングが見つかりません"
          description="検索条件を変更してください。"
          icon={<Users className="h-6 w-6" />}
        />
      ) : (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {meetings.map((m) => {
            const related = relatedLabels(m);
            const time = timeOf(m.datetime);
            return (
              <li key={m.id} className="relative">
                <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-gold-400 bg-card" />
                <Card>
                  <CardContent className="space-y-4 p-5">
                    {/* 日時・関連 */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                        <CalendarClock className="h-4 w-4 text-navy-500" />
                        {formatDate(m.datetime)}
                        {time && <span className="text-muted-foreground">{time}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {related.map((r) => (
                          <Badge key={r} tone="navy">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {m.agenda && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">議題</p>
                        <p className="mt-0.5 text-sm font-medium text-navy-800">{m.agenda}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">参加者</p>
                      <p className="mt-0.5 text-sm text-navy-800">{m.attendees}</p>
                    </div>

                    {m.minutes && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">議事録</p>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-navy-800">
                          {m.minutes}
                        </p>
                      </div>
                    )}

                    {m.decisions && (
                      <div className="rounded-lg bg-navy-50/70 p-3">
                        <p className="text-xs font-medium text-muted-foreground">決定事項</p>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-navy-800">
                          {m.decisions}
                        </p>
                      </div>
                    )}

                    {m.actions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          次回までのタスク
                        </p>
                        <ul className="mt-1 space-y-1">
                          {m.actions.map((a, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-navy-800"
                            >
                              <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.nextDate && (
                      <div className="border-t border-border pt-3 text-sm">
                        <span className="text-muted-foreground">次回開催日：</span>
                        <span className="font-medium text-navy-800">
                          {formatDate(m.nextDate)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
