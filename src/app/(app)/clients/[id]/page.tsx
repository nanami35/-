import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getClient,
  getUserMap,
  getStoresByClient,
  getMeetings,
} from "@/lib/data";
import { CONTRACT_STATUS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { ContractStatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const TABS = [
  { value: "overview", label: "概要" },
  { value: "stores", label: "店舗" },
  { value: "meetings", label: "ミーティング" },
];

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const tab = sp.tab ?? "overview";

  const client = await getClient(id);
  if (!client) notFound();

  const [userMap, stores, allMeetings] = await Promise.all([
    getUserMap(),
    getStoresByClient(id),
    getMeetings(),
  ]);
  const meetings = allMeetings.filter((m) => m.clientId === id);

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy-700"
      >
        <ArrowLeft className="h-4 w-4" />
        クライアント一覧へ戻る
      </Link>

      <PageHeader title={client.name}>
        <div className="flex flex-wrap items-center gap-2">
          <ContractStatusBadge value={client.contractStatus} />
          {client.plan && <Badge tone="navy">{client.plan}</Badge>}
          {client.monthlyFee != null && (
            <Badge tone="gold">月額 {formatCurrency(client.monthlyFee)}</Badge>
          )}
        </div>
      </PageHeader>

      <Tabs items={TABS} defaultValue="overview" />

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <DataList
                columns={2}
                items={[
                  { label: "代表者名", value: client.representativeName },
                  { label: "担当者名", value: client.contactName },
                  { label: "電話番号", value: client.phone },
                  { label: "メールアドレス", value: client.email },
                  { label: "住所", value: client.address, full: true },
                  {
                    label: "Webサイト",
                    value: client.website ? (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy-700 underline hover:text-gold-600"
                      >
                        {client.website}
                      </a>
                    ) : null,
                    full: true,
                  },
                  {
                    label: "契約状況",
                    value: CONTRACT_STATUS[client.contractStatus],
                  },
                  { label: "担当コンサルタント", value: userMap.get(client.consultantId)?.name ?? "未割当" },
                  { label: "契約開始日", value: formatDate(client.contractStartDate) },
                  { label: "契約終了日", value: formatDate(client.contractEndDate) },
                  { label: "契約プラン", value: client.plan ?? null },
                  { label: "月額料金", value: formatCurrency(client.monthlyFee) },
                  { label: "支援目的", value: client.supportGoal ?? null, full: true },
                  { label: "現状の課題", value: client.currentIssues ?? null, full: true },
                  { label: "目標", value: client.goal ?? null, full: true },
                  { label: "社内メモ", value: client.memo ?? null, full: true },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <FileText className="h-5 w-5 text-navy-500" />
              <CardTitle>契約書・提案書</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="ファイル管理は準備中です"
                description="契約書や提案書のファイル管理機能はフェーズ2で提供予定です。"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "stores" && (
        <Card>
          <CardHeader>
            <CardTitle>店舗一覧（{stores.length}件）</CardTitle>
          </CardHeader>
          <CardContent className={stores.length === 0 ? "" : "p-0"}>
            {stores.length === 0 ? (
              <EmptyState
                title="店舗がありません"
                description="このクライアントに紐づく店舗はまだ登録されていません。"
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>店舗名</TH>
                    <TH>業態</TH>
                    <TH>フェーズ</TH>
                    <TH>担当</TH>
                    <TH className="text-right">月間売上</TH>
                    <TH className="text-right">客単価</TH>
                  </TR>
                </THead>
                <TBody>
                  {stores.map((s) => (
                    <TR key={s.id}>
                      <TD>
                        <Link
                          href={`/stores/${s.id}`}
                          className="font-medium text-navy-700 hover:text-gold-600 hover:underline"
                        >
                          {s.name}
                        </Link>
                      </TD>
                      <TD>{s.businessType}</TD>
                      <TD>
                        <Badge tone="info">{s.phase}</Badge>
                      </TD>
                      <TD>{userMap.get(s.consultantId)?.name ?? "未割当"}</TD>
                      <TD className="text-right">{formatCurrency(s.monthlySales)}</TD>
                      <TD className="text-right">{formatCurrency(s.avgSpend)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "meetings" && (
        <Card>
          <CardHeader>
            <CardTitle>ミーティング履歴（{meetings.length}件）</CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <EmptyState
                title="ミーティング記録がありません"
                description="このクライアントに紐づくミーティングはまだ登録されていません。"
              />
            ) : (
              <ol className="space-y-4">
                {meetings.map((m) => (
                  <li
                    key={m.id}
                    className="relative rounded-lg border border-border p-4 pl-5"
                  >
                    <span className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-gold-400" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-navy-800">
                        {formatDate(m.datetime)}
                      </p>
                      <span className="text-xs text-muted-foreground">{m.attendees}</span>
                    </div>
                    {m.agenda && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">議題</p>
                        <p className="text-sm text-navy-800">{m.agenda}</p>
                      </div>
                    )}
                    {m.minutes && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">議事録</p>
                        <p className="whitespace-pre-line text-sm text-navy-800">{m.minutes}</p>
                      </div>
                    )}
                    {m.decisions && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">決定事項</p>
                        <p className="whitespace-pre-line text-sm text-navy-800">{m.decisions}</p>
                      </div>
                    )}
                    {m.actions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">アクション</p>
                        <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-navy-800">
                          {m.actions.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {m.nextDate && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        次回: {formatDate(m.nextDate)}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
