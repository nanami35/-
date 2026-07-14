import Link from "next/link";
import {
  Building2, Store as StoreIcon, TrendingUp, CheckCircle2, AlertOctagon,
  CalendarClock, Trophy, AlertTriangle, ClipboardX, Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getDashboardMetrics, getClient, getUserName,
} from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const m = getDashboardMetrics();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`ダッシュボード`}
        description={`${user.name} さん、こんにちは。運用中の全案件の状況を確認できます。`}
      />

      {/* KPI サマリー */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="契約中クライアント" value={m.activeClients} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="運用中店舗" value={m.activeStores} icon={<StoreIcon className="h-5 w-5" />} />
        <StatCard label="今月の売上改善額" value={formatCurrency(m.monthlySalesImprovement)} tone="gold" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="タスク完了率" value={formatPercent(m.taskCompletionRate, 0)} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="期限超過タスク" value={m.overdueTasks} tone={m.overdueTasks > 0 ? "danger" : "default"} icon={<AlertOctagon className="h-5 w-5" />} />
        <StatCard
          label="次回定例MTG"
          value={m.nextMeeting ? formatDate(m.nextMeeting.date).replace("2026年", "") : "—"}
          sub={m.nextMeeting?.store}
          icon={<CalendarClock className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 成果ランキング */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center gap-2">
            <Trophy className="h-5 w-5 text-gold-500" />
            <CardTitle>店舗別 成果ランキング</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>順位</TH>
                  <TH>店舗</TH>
                  <TH className="text-right">売上改善額</TH>
                  <TH>目標達成率</TH>
                </TR>
              </THead>
              <TBody>
                {m.storeRanking.map((r, i) => (
                  <TR key={r.store.id}>
                    <TD>
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-gold-100 text-gold-700" : "bg-navy-100 text-navy-600"}`}>
                        {i + 1}
                      </span>
                    </TD>
                    <TD>
                      <Link href={`/stores/${r.store.id}`} className="font-medium text-navy-700 hover:text-gold-600 hover:underline">
                        {r.store.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{getClient(r.store.clientId)?.name}</p>
                    </TD>
                    <TD className="text-right font-medium">
                      <span className={r.improvement >= 0 ? "text-success" : "text-danger"}>
                        {r.improvement >= 0 ? "+" : ""}{formatCurrency(r.improvement)}
                      </span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={r.achievement}
                          tone={r.achievement >= 100 ? "success" : r.achievement >= 80 ? "gold" : "warning"}
                          className="w-20"
                        />
                        <span className="text-xs text-muted-foreground">{formatPercent(r.achievement, 0)}</span>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        {/* 注意が必要な店舗 */}
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>注意が必要な店舗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {m.attentionStores.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">注意が必要な店舗はありません。</p>
            ) : (
              m.attentionStores.map((a) => (
                <Link
                  key={a.store.id}
                  href={`/stores/${a.store.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-navy-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-800">{a.store.name}</p>
                    <p className="text-xs text-warning">{a.reason}</p>
                  </div>
                  <Badge tone="warning">要確認</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* KPI 未入力の店舗 */}
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <ClipboardX className="h-5 w-5 text-navy-500" />
            <CardTitle>KPI未入力の店舗</CardTitle>
          </CardHeader>
          <CardContent>
            {m.kpiMissingStores.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">当月のKPIはすべて入力済みです。</p>
            ) : (
              <ul className="space-y-2">
                {m.kpiMissingStores.map((s) => (
                  <li key={s.id}>
                    <Link href={`/kpi?store=${s.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-navy-50">
                      <span className="truncate text-sm text-navy-800">{s.name}</span>
                      <Badge tone="muted">未入力</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 最近更新された案件 */}
        <Card>
          <CardHeader>
            <CardTitle>最近更新された案件</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {m.recentlyUpdated.map(({ store, client }) => (
                <li key={store.id}>
                  <Link href={`/stores/${store.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-navy-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-800">{store.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{client?.name}</p>
                    </div>
                    <Badge tone="info">{store.phase}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 担当者ごとの案件 */}
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Users className="h-5 w-5 text-navy-500" />
            <CardTitle>担当者別の状況</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>担当者</TH>
                  <TH className="text-right">店舗</TH>
                  <TH className="text-right">未完了</TH>
                </TR>
              </THead>
              <TBody>
                {m.consultantLoad.map((c) => (
                  <TR key={c.user.id}>
                    <TD className="font-medium text-navy-800">{c.user.name}</TD>
                    <TD className="text-right">{c.storeCount}</TD>
                    <TD className="text-right">
                      <Badge tone={c.openTasks > 3 ? "warning" : "muted"}>{c.openTasks}</Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {m.consultantLoad.length === 0 && <EmptyState className="mt-2" description="担当者データがありません。" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
