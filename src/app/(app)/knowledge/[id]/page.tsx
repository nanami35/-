import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { canApprove, canEdit } from "@/lib/rbac";
import { isFavorite, q, userName } from "@/lib/queries";
import { Card, CardBody } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Field, BulletList } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { FavoriteButton, StatusActions } from "@/components/interactive";
import { CommentSection } from "@/components/comment-section";
import { Markdown } from "@/components/markdown";
import { IMPORTANCE_LABELS } from "@/lib/labels";
import { CheckSquare } from "lucide-react";

export default async function KnowledgeDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const k = await q.getKnowledge(user, id);
  if (!k) notFound();
  const path = `/knowledge/${id}`;

  const relatedCompanies = (await q.companies(user)).filter((c) => k.relatedCompanyIds?.includes(c.id));
  const relatedCases = (await q.cases(user)).filter((c) => k.relatedCaseIds?.includes(c.id));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="navy">{k.category}</Badge>
            {k.importance && <Badge tone="gold">重要度{IMPORTANCE_LABELS[k.importance]}</Badge>}
          </div>
          <h1 className="mt-2 text-xl font-bold text-navy">{k.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{k.summary}</p>
          <div className="mt-2">
            <TrustBadges e={k} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <FavoriteButton entityType="knowledge" entityId={k.id} path={path} initial={isFavorite(user.id, "knowledge", k.id)} />
          <StatusActions entityType="knowledge" entityId={k.id} status={k.status} path={path} canApprove={canApprove(user)} canEdit={canEdit(user)} />
        </div>
      </div>

      <Card>
        <CardBody>
          <Tabs
            tabs={[
              {
                key: "content",
                label: "本文",
                content: (
                  <div className="space-y-4">
                    <Field label="結論">{k.conclusion}</Field>
                    <Field label="背景">{k.background}</Field>
                    <Field label="原理原則">{k.principles}</Field>
                    <div>
                      <div className="mb-1 text-[11px] font-medium uppercase text-muted">実践方法</div>
                      <div className="rounded-lg bg-canvas p-3">
                        <Markdown source={k.practice} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-green-50/50 p-3">
                        <div className="mb-1 text-sm font-semibold text-success">成功例</div>
                        <p className="text-sm text-ink">{k.successExample ?? "—"}</p>
                      </div>
                      <div className="rounded-lg bg-red-50/50 p-3">
                        <div className="mb-1 text-sm font-semibold text-danger">失敗例</div>
                        <p className="text-sm text-ink">{k.failureExample ?? "—"}</p>
                      </div>
                    </div>
                    <Field label="注意点">{k.cautions}</Field>
                    {k.checklist && k.checklist.length > 0 && (
                      <div>
                        <div className="mb-1 text-[11px] font-medium uppercase text-muted">チェックリスト</div>
                        <ul className="space-y-1">
                          {k.checklist.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-ink">
                              <CheckSquare className="h-4 w-4 text-navy-100" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "usage",
                label: "自社での活用",
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-navy-50/50 p-3">
                      <div className="mb-1 text-sm font-semibold text-navy">ABENGERSでの活用方法</div>
                      <p className="text-sm text-ink">{k.abengersUsage ?? "—"}</p>
                    </div>
                    <div className="rounded-lg bg-gold/5 p-3">
                      <div className="mb-1 text-sm font-semibold text-gold-dark">コエニでの活用方法</div>
                      <p className="text-sm text-ink">{k.koeniUsage ?? "—"}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "related",
                label: "関連情報",
                content: (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-navy">関連企業</div>
                      <RelatedLinks items={relatedCompanies.map((c) => ({ href: `/companies/${c.id}`, label: c.name }))} />
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-semibold text-navy">関連事例</div>
                      <RelatedLinks items={relatedCases.map((c) => ({ href: `/cases/${c.id}`, label: c.title }))} />
                    </div>
                    <Field label="出典">
                      <BulletList items={k.sources} />
                    </Field>
                    <div className="pt-2 text-xs text-muted">
                      作成者: {userName(k.createdBy)}｜最終更新: {k.updatedAt.slice(0, 10)}｜最終確認: {k.lastVerifiedAt}
                    </div>
                  </div>
                ),
              },
              {
                key: "comments",
                label: "コメント",
                content: <CommentSection entityType="knowledge" entityId={k.id} path={path} />,
              },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}

function RelatedLinks({ items }: { items: { href: string; label: string }[] }) {
  if (items.length === 0) return <p className="text-sm text-muted">—</p>;
  return (
    <ul className="space-y-1">
      {items.map((it) => (
        <li key={it.href}>
          <Link href={it.href} className="text-sm text-info hover:underline">
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
