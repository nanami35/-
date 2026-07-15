import { ListChecks } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTasks, getStores, getUsers, getUserMap, getStoreMap, getClientMap } from "@/lib/data";
import { TASK_STATUS, PRIORITY, type TaskStatus, type Priority } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { TaskStatusBadge, PriorityBadge } from "@/components/status-badge";
import { formatDate, isOverdue } from "@/lib/utils";
import type { Task, Store, Client, User } from "@/types";

const STATUS_OPTIONS = Object.entries(TASK_STATUS).map(([value, label]) => ({
  value,
  label,
}));

const VIEW_ITEMS = [
  { value: "list", label: "リスト" },
  { value: "kanban", label: "カンバン" },
  { value: "calendar", label: "カレンダー" },
];

/** 優先度ごとのチップ配色 */
const PRIORITY_CHIP: Record<Priority, string> = {
  low: "border-l-navy-300",
  medium: "border-l-blue-400",
  high: "border-l-orange-400",
  urgent: "border-l-red-500",
};

/** タスクの関連先（店舗名 or クライアント名）を返す */
function relatedLabel(
  t: Task,
  storeMap: Map<string, Store>,
  clientMap: Map<string, Client>
): string {
  if (t.storeId) return storeMap.get(t.storeId)?.name ?? "—";
  if (t.clientId) return clientMap.get(t.clientId)?.name ?? "—";
  return "—";
}

/** チェックリストの進捗（完了/合計） */
function checklistProgress(t: Task): { done: number; total: number } | null {
  if (!t.checklist || t.checklist.length === 0) return null;
  return {
    done: t.checklist.filter((c) => c.done).length,
    total: t.checklist.length,
  };
}

/* ---- 2026年7月 カレンダー用の定数 ---- */
const CAL_YEAR = 2026;
const CAL_MONTH = 7; // 7月
const CAL_FIRST_WEEKDAY = 3; // 2026-07-01 は水曜日（日=0）
const CAL_DAYS = 31;
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    store?: string;
    assignee?: string;
    status?: string;
    view?: string;
  }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const store = sp.store ?? "";
  const assignee = sp.assignee ?? "";
  const status = sp.status ?? "";
  const view = sp.view ?? "list";

  let tasks = await getTasks();
  if (store) tasks = tasks.filter((t) => t.storeId === store);
  if (assignee) tasks = tasks.filter((t) => t.assigneeId === assignee);
  if (status) tasks = tasks.filter((t) => t.status === (status as TaskStatus));
  if (q) tasks = tasks.filter((t) => t.title.toLowerCase().includes(q));

  const [storeList, users, userMap, storeMap, clientMap] = await Promise.all([
    getStores(),
    getUsers(),
    getUserMap(),
    getStoreMap(),
    getClientMap(),
  ]);
  const storeOptions = storeList.map((s) => ({ value: s.id, label: s.name }));
  const assigneeOptions = users
    .filter((u) => u.role !== "client")
    .map((u) => ({ value: u.id, label: u.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="タスク"
        description="運用中の全タスクをリスト・カンバン・カレンダーで管理します。"
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="タスク名で検索..." />
        <FilterSelect param="store" options={storeOptions} allLabel="すべての店舗" />
        <FilterSelect param="assignee" options={assigneeOptions} allLabel="すべての担当" />
        <FilterSelect param="status" options={STATUS_OPTIONS} allLabel="すべてのステータス" />
        <span className="ml-auto text-sm text-muted-foreground">{tasks.length}件</span>
      </div>

      <Tabs param="view" items={VIEW_ITEMS} defaultValue="list" />

      {tasks.length === 0 ? (
        <EmptyState
          title="タスクが見つかりません"
          description="検索条件を変更してください。"
          icon={<ListChecks className="h-6 w-6" />}
        />
      ) : view === "kanban" ? (
        <KanbanView tasks={tasks} userMap={userMap} />
      ) : view === "calendar" ? (
        <CalendarView tasks={tasks} />
      ) : (
        <ListView
          tasks={tasks}
          userMap={userMap}
          storeMap={storeMap}
          clientMap={clientMap}
        />
      )}
    </div>
  );
}

/* ============================================================
 * リストビュー
 * ========================================================== */
function ListView({
  tasks,
  userMap,
  storeMap,
  clientMap,
}: {
  tasks: Task[];
  userMap: Map<string, User>;
  storeMap: Map<string, Store>;
  clientMap: Map<string, Client>;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <THead>
            <TR>
              <TH>タスク名</TH>
              <TH>担当</TH>
              <TH>期限</TH>
              <TH>優先度</TH>
              <TH>ステータス</TH>
              <TH>関連</TH>
            </TR>
          </THead>
          <TBody>
            {tasks.map((t) => {
              const overdue = isOverdue(t.dueDate) && t.status !== "done";
              const progress = checklistProgress(t);
              return (
                <TR key={t.id}>
                  <TD className="font-medium text-navy-800">
                    <div className="space-y-1">
                      <span>{t.title}</span>
                      {progress && (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(progress.done / progress.total) * 100}
                            tone={progress.done === progress.total ? "success" : "navy"}
                            className="w-16"
                          />
                          <span className="text-xs font-normal text-muted-foreground">
                            {progress.done}/{progress.total}
                          </span>
                        </div>
                      )}
                    </div>
                  </TD>
                  <TD className="text-sm">{userMap.get(t.assigneeId ?? "")?.name ?? "未割当"}</TD>
                  <TD
                    className={`whitespace-nowrap text-xs ${
                      overdue ? "font-semibold text-danger" : "text-muted-foreground"
                    }`}
                  >
                    {formatDate(t.dueDate)}
                  </TD>
                  <TD>
                    <PriorityBadge value={t.priority} />
                  </TD>
                  <TD>
                    <TaskStatusBadge value={t.status} />
                  </TD>
                  <TD className="text-sm">{relatedLabel(t, storeMap, clientMap)}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ============================================================
 * カンバンビュー
 * ========================================================== */
function KanbanView({
  tasks,
  userMap,
}: {
  tasks: Task[];
  userMap: Map<string, User>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {(Object.entries(TASK_STATUS) as [TaskStatus, string][]).map(([key, label]) => {
        const columnTasks = tasks.filter((t) => t.status === key);
        return (
          <div key={key} className="rounded-xl border border-border bg-muted/30">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-navy-700">{label}</span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-100 px-1.5 text-xs font-medium text-navy-600">
                {columnTasks.length}
              </span>
            </div>
            <div className="space-y-2 p-3">
              {columnTasks.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">タスクなし</p>
              ) : (
                columnTasks.map((t) => {
                  const overdue = isOverdue(t.dueDate) && t.status !== "done";
                  return (
                    <div
                      key={t.id}
                      className={`rounded-lg border border-border border-l-4 bg-card p-3 shadow-sm ${PRIORITY_CHIP[t.priority]}`}
                    >
                      <p className="text-sm font-medium text-navy-800">{t.title}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-600">
                            {(userMap.get(t.assigneeId ?? "")?.name ?? "未割当").charAt(0)}
                          </span>
                          <PriorityBadge value={t.priority} />
                        </div>
                        <span
                          className={`whitespace-nowrap text-xs ${
                            overdue ? "font-semibold text-danger" : "text-muted-foreground"
                          }`}
                        >
                          {formatDate(t.dueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * カレンダービュー（2026年7月）
 * ========================================================== */
function CalendarView({ tasks }: { tasks: Task[] }) {
  // 日付ごとにタスクを割り当てる
  const byDay = new Map<number, Task[]>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    // "2026-07-16" 形式の想定
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t.dueDate);
    if (!m) continue;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (year !== CAL_YEAR || month !== CAL_MONTH) continue;
    const list = byDay.get(day);
    if (list) list.push(t);
    else byDay.set(day, [t]);
  }

  // 先頭の空白セル + 各日セル
  const cells: (number | null)[] = [];
  for (let i = 0; i < CAL_FIRST_WEEKDAY; i++) cells.push(null);
  for (let d = 1; d <= CAL_DAYS; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-3 text-sm font-semibold text-navy-700">2026年7月</p>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {WEEKDAY_LABELS.map((w, i) => (
            <div
              key={w}
              className={`bg-navy-50 py-2 text-center text-xs font-semibold ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-navy-600"
              }`}
            >
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            const dayTasks = day ? byDay.get(day) ?? [] : [];
            return (
              <div
                key={i}
                className={`min-h-24 bg-card p-1.5 ${day ? "" : "bg-muted/40"}`}
              >
                {day && (
                  <>
                    <span className="text-xs font-medium text-muted-foreground">{day}</span>
                    <div className="mt-1 space-y-1">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`truncate rounded border-l-2 bg-navy-50 px-1.5 py-0.5 text-[11px] text-navy-800 ${PRIORITY_CHIP[t.priority]}`}
                          title={t.title}
                        >
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
