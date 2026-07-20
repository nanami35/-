import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { q } from "@/lib/queries";
import { db } from "@/lib/store";
import { canApprove } from "@/lib/rbac";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { NOTIF_LABELS, NOTIF_TONE, categoryLabel } from "@/lib/labels";
import {
  Building2,
  BookOpen,
  Trophy,
  Boxes,
  TrendingUp,
  Sparkles,
  Star,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const companies = await q.companies(user);
  const knowledge = await q.knowledge(user);
  const cases = await q.cases(user);
  const models = await q.businessModels(user);
  const projects = await q.projects(user);

  const pendingApprovals = canApprove(user)
    ? [...companies, ...knowledge, ...cases].filter((e) => e.status === "pending_review")
    : [];

  const recentKnowledge = [...knowledge]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  const notableCompanies = companies
    .filter((c) => c.tags?.includes("重要事例") || c.category === "abengers")
    .slice(0, 3);

  const notifications = db.notifications
    .filter((n) => n.userId === user.id)
    .slice(0, 4);

  const myFavorites = db.favorites.filter((f) => f.userId === user.id);
  const needsRecheck = [...companies, ...knowledge, ...cases].filter(
    (e) => e.certaintyLevel === "needs_check" || e.status === "needs_recheck",
  );

  const stats = [
    { label: "企業", value: companies.length, icon: Building2, href: "/companies" },
    { label: "ビジネスモデル", value: models.length, icon: Boxes, href: "/business-models" },
    { label: "ノウハウ", value: knowledge.length, icon: BookOpen, href: "/knowledge" },
    { label: "成功・失敗事例", value: cases.length, icon: Trophy, href: "/cases" },
  ];

  return (
    <div>
      <PageHeader
        title={`おかえりなさい、${user.name} さん`}
        description="ABENGERSの事業創造力を高める社内経営ナレッジの全体像です。"
      />

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="transition-shadow hover:shadow-panel">
                <CardBody className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-50 text-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-navy">{s.value}</div>
                    <div className="text-xs text-muted">{s.label}</div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* 左2カラム */}
        <div className="space-y-5 lg:col-span-2">
          {/* 最近のナレッジ */}
          <Card>
            <CardHeader
              title="最近更新されたナレッジ"
              action={
                <Link href="/knowledge" className="text-xs text-info hover:underline">
                  すべて見る
                </Link>
              }
            />
            <CardBody className="divide-y divide-navy-100/50 p-0">
              {recentKnowledge.map((k) => (
                <Link
                  key={k.id}
                  href={`/knowledge/${k.id}`}
                  className="flex items-start justify-between gap-3 px-5 py-3 hover:bg-navy-50/40"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-navy">{k.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <Badge tone="navy">{k.category}</Badge>
                      {k.summary}
                    </div>
                  </div>
                  <TrustBadges e={k} />
                </Link>
              ))}
            </CardBody>
          </Card>

          {/* 注目企業 */}
          <Card>
            <CardHeader title="注目企業・重要事例" />
            <CardBody className="grid gap-3 sm:grid-cols-3">
              {notableCompanies.map((c) => (
                <Link
                  key={c.id}
                  href={`/companies/${c.id}`}
                  className="rounded-lg border border-navy-100/60 p-3 hover:border-navy-100 hover:shadow-card"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-navy-700 text-xs font-bold text-gold">
                    {c.logoText}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-navy">{c.name}</div>
                  <div className="text-xs text-muted">{categoryLabel(c.category)}</div>
                </Link>
              ))}
            </CardBody>
          </Card>

          {/* AIが抽出した応用候補 */}
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-gold" />
                  AIが抽出した自社への応用候補
                </span>
              }
            />
            <CardBody className="space-y-2">
              {companies
                .flatMap((c) =>
                  (c.application.abengersLearnings ?? []).slice(0, 1).map((l) => ({ c, l })),
                )
                .slice(0, 4)
                .map(({ c, l }, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-canvas px-3 py-2 text-sm">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-ink">
                      <Link href={`/companies/${c.id}`} className="font-medium text-navy hover:underline">
                        {c.name}
                      </Link>
                      より：{l}
                    </span>
                  </div>
                ))}
            </CardBody>
          </Card>
        </div>

        {/* 右カラム */}
        <div className="space-y-5">
          {/* 承認待ち */}
          {canApprove(user) && (
            <Card>
              <CardHeader
                title="承認待ち情報"
                subtitle={`${pendingApprovals.length}件`}
                action={
                  <Link href="/approvals" className="text-xs text-info hover:underline">
                    確認
                  </Link>
                }
              />
              <CardBody className="space-y-2">
                {pendingApprovals.length === 0 && (
                  <p className="text-sm text-muted">承認待ちはありません。</p>
                )}
                {pendingApprovals.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-ink">
                      {"name" in e ? (e as { name: string }).name : (e as { title: string }).title}
                    </span>
                    <Badge tone="gold">確認待ち</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* 重要通知 */}
          <Card>
            <CardHeader title="重要通知" action={<Link href="/notifications" className="text-xs text-info hover:underline">一覧</Link>} />
            <CardBody className="space-y-2">
              {notifications.map((n) => (
                <Link key={n.id} href={n.link ?? "/notifications"} className="block rounded-lg px-2 py-1.5 hover:bg-navy-50/50">
                  <div className="flex items-center gap-2">
                    <Badge tone={NOTIF_TONE[n.level]}>{NOTIF_LABELS[n.level]}</Badge>
                    <span className="truncate text-sm font-medium text-navy">{n.title}</span>
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>

          {/* 要再確認 */}
          <Card>
            <CardHeader title="要再確認の情報" subtitle={`${needsRecheck.length}件`} />
            <CardBody className="space-y-1.5">
              {needsRecheck.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-sm">
                  <CalendarClock className="h-3.5 w-3.5 text-warning" />
                  <span className="truncate text-ink">
                    {"name" in e ? (e as { name: string }).name : (e as { title: string }).title}
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* お気に入り・担当 */}
          <Card>
            <CardHeader title="お気に入り" subtitle={`${myFavorites.length}件`} action={<Link href="/favorites" className="text-xs text-info hover:underline">一覧</Link>} />
            <CardBody>
              {myFavorites.length === 0 ? (
                <p className="text-sm text-muted">お気に入りはまだありません。</p>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted">
                  <Star className="h-4 w-4 text-gold" />
                  {myFavorites.length}件の情報を保存中
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}
            </CardBody>
          </Card>

          {/* 担当プロジェクト */}
          {projects.length > 0 && (
            <Card>
              <CardHeader title="担当プロジェクト" />
              <CardBody className="space-y-1.5">
                {projects.slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block truncate text-sm text-navy hover:underline">
                    {p.name}
                    <span className="ml-2 text-xs text-muted">{p.projectStatus}</span>
                  </Link>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
