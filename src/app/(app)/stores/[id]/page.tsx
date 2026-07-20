import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users,
  Receipt,
  Gauge,
  ClipboardList,
  AlertTriangle,
  LineChart,
  Rocket,
  FileText,
  Swords,
  Target,
  Globe,
  MapPin,
  Instagram,
  Music2,
  MessageCircle,
  Utensils,
  Link2,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getStore,
  getClient,
  getUserName,
  getLatestDiagnosis,
  getHearingByStore,
  getDiagnosesByStore,
  getIssuesByStore,
  getKpiByStore,
  getInitiativesByStore,
  getReportsByStore,
  getCompetitorsByStore,
  getStrategyByStore,
} from "@/lib/data";
import { computeDiagnosis } from "@/lib/scoring";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import type { Store } from "@/types";

const TABS = [
  { value: "basic", label: "基本情報" },
  { value: "media", label: "外部媒体" },
  { value: "support", label: "支援情報" },
  { value: "related", label: "関連データ" },
];

const yesNo = (v: boolean | undefined) => (v ? "あり" : "なし");

const MEDIA_FIELDS: {
  key: keyof Store;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "officialUrl", label: "公式サイト", icon: <Globe className="h-4 w-4" /> },
  { key: "googleBusinessUrl", label: "Googleビジネス", icon: <MapPin className="h-4 w-4" /> },
  { key: "instagramUrl", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { key: "tiktokUrl", label: "TikTok", icon: <Music2 className="h-4 w-4" /> },
  { key: "lineUrl", label: "LINE公式", icon: <MessageCircle className="h-4 w-4" /> },
  { key: "tabelogUrl", label: "食べログ", icon: <Utensils className="h-4 w-4" /> },
  { key: "hotpepperUrl", label: "ホットペッパー", icon: <Utensils className="h-4 w-4" /> },
  { key: "otherMedia", label: "その他", icon: <Link2 className="h-4 w-4" /> },
];

export default async function StoreDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const tab = sp.tab ?? "basic";

  const store = await getStore(id);
  if (!store) notFound();

  const client = await getClient(store.clientId);
  const consultantName = await getUserName(store.consultantId);
  const latest = await getLatestDiagnosis(id);
  const total = latest ? computeDiagnosis(latest.scores).total : null;

  const [
    hearing,
    diagnoses,
    issues,
    kpi,
    initiatives,
    reports,
    competitors,
    strategy,
  ] = await Promise.all([
    getHearingByStore(id),
    getDiagnosesByStore(id),
    getIssuesByStore(id),
    getKpiByStore(id),
    getInitiativesByStore(id),
    getReportsByStore(id),
    getCompetitorsByStore(id),
    getStrategyByStore(id),
  ]);

  const relatedCards = [
    {
      href: `/hearings?store=${id}`,
      label: "ヒアリング",
      icon: <ClipboardList className="h-5 w-5" />,
      count: hearing ? 1 : 0,
    },
    {
      href: `/diagnoses?store=${id}`,
      label: "店舗診断",
      icon: <Gauge className="h-5 w-5" />,
      count: diagnoses.length,
    },
    {
      href: `/issues?store=${id}`,
      label: "課題",
      icon: <AlertTriangle className="h-5 w-5" />,
      count: issues.length,
    },
    {
      href: `/kpi?store=${id}`,
      label: "KPI",
      icon: <LineChart className="h-5 w-5" />,
      count: kpi.length,
    },
    {
      href: `/initiatives?store=${id}`,
      label: "施策",
      icon: <Rocket className="h-5 w-5" />,
      count: initiatives.length,
    },
    {
      href: `/reports?store=${id}`,
      label: "月次レポート",
      icon: <FileText className="h-5 w-5" />,
      count: reports.length,
    },
    {
      href: `/competitors?store=${id}`,
      label: "競合",
      icon: <Swords className="h-5 w-5" />,
      count: competitors.length,
    },
    {
      href: `/strategies?store=${id}`,
      label: "戦略",
      icon: <Target className="h-5 w-5" />,
      count: strategy ? 1 : 0,
    },
  ];

  const activeMedia = MEDIA_FIELDS.filter((f) => {
    const v = store[f.key];
    return typeof v === "string" && v.trim() !== "";
  });

  return (
    <div className="space-y-6">
      <Link
        href="/stores"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy-700"
      >
        <ArrowLeft className="h-4 w-4" />
        店舗一覧へ戻る
      </Link>

      <PageHeader title={store.name}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info">{store.phase}</Badge>
          <Badge tone="muted">担当: {consultantName}</Badge>
        </div>
      </PageHeader>

      {client && (
        <p className="text-sm text-muted-foreground">
          クライアント:{" "}
          <Link
            href={`/clients/${client.id}`}
            className="font-medium text-navy-700 hover:text-gold-600 hover:underline"
          >
            {client.name}
          </Link>
        </p>
      )}

      {/* クイックスタット */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="月間売上"
          value={formatCurrency(store.monthlySales)}
          tone="gold"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="月間客数"
          value={formatNumber(store.monthlyCustomers, "人")}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="客単価"
          value={formatCurrency(store.avgSpend)}
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          label="最新診断総合点"
          value={total != null ? `${total}点` : "—"}
          sub={latest ? formatDate(latest.date) : undefined}
          tone="success"
          icon={<Gauge className="h-5 w-5" />}
        />
      </div>

      <Tabs items={TABS} defaultValue="basic" />

      {tab === "basic" && (
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList
              columns={2}
              items={[
                { label: "店舗名", value: store.name },
                { label: "業態", value: store.businessType },
                { label: "ジャンル", value: store.genre },
                { label: "住所", value: store.address, full: true },
                { label: "営業時間", value: store.openingHours ?? null },
                { label: "定休日", value: store.closedDays ?? null },
                {
                  label: "席数",
                  value: store.seats != null ? formatNumber(store.seats, "席") : null,
                },
                {
                  label: "駐車場台数",
                  value: store.parkingLots != null ? formatNumber(store.parkingLots, "台") : null,
                },
                { label: "客単価", value: formatCurrency(store.avgSpend) },
                { label: "月間売上", value: formatCurrency(store.monthlySales) },
                { label: "月間客数", value: formatNumber(store.monthlyCustomers, "人") },
                {
                  label: "従業員数",
                  value: store.employees != null ? formatNumber(store.employees, "名") : null,
                },
                { label: "テイクアウト", value: yesNo(store.takeout) },
                { label: "デリバリー", value: yesNo(store.delivery) },
                { label: "予約方法", value: store.reservationMethod ?? null },
                { label: "主な顧客層", value: store.mainCustomerSegment ?? null, full: true },
                { label: "商圏", value: store.tradeArea ?? null },
                { label: "店舗責任者", value: store.managerName ?? null },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {tab === "media" && (
        <Card>
          <CardHeader>
            <CardTitle>外部媒体</CardTitle>
          </CardHeader>
          <CardContent>
            {activeMedia.length === 0 ? (
              <EmptyState
                icon={<Globe className="h-6 w-6" />}
                title="外部媒体の登録がありません"
                description="公式サイトやSNSなどの外部媒体はまだ登録されていません。"
              />
            ) : (
              <ul className="divide-y divide-border">
                {activeMedia.map((f) => {
                  const url = String(store[f.key]);
                  const isLink = url.startsWith("http");
                  return (
                    <li
                      key={f.key}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-navy-700">
                        <span className="text-navy-500">{f.icon}</span>
                        {f.label}
                      </span>
                      {isLink ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="max-w-[60%] truncate text-sm text-navy-700 underline hover:text-gold-600"
                        >
                          {url}
                        </a>
                      ) : (
                        <span className="max-w-[60%] truncate text-sm text-navy-800">{url}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "support" && (
        <Card>
          <CardHeader>
            <CardTitle>支援情報</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList
              columns={2}
              items={[
                { label: "支援開始日", value: formatDate(store.supportStartDate) },
                { label: "担当者", value: consultantName },
                { label: "現在のフェーズ", value: <Badge tone="info">{store.phase}</Badge> },
                { label: "重要課題", value: store.keyIssue ?? null, full: true },
                { label: "今月の重点施策", value: store.monthlyFocus ?? null, full: true },
                { label: "達成目標", value: store.targetGoal ?? null, full: true },
                { label: "次回ミーティング日", value: formatDate(store.nextMeetingDate) },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {tab === "related" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {relatedCards.map((r) => (
            <Link key={r.href} href={r.href} className="group">
              <Card className="h-full p-5 transition-colors hover:border-gold-300 hover:bg-navy-50/40">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                    {r.icon}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600" />
                </div>
                <p className="mt-3 text-sm font-medium text-navy-700">{r.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-navy-800">{r.count}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
