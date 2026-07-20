import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canApprove, canEdit } from "@/lib/rbac";
import { getOne, isFavorite } from "@/lib/queries";
import { db } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Field, BulletList } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { FavoriteButton, StatusActions } from "@/components/interactive";
import { CommentSection } from "@/components/comment-section";
import { TrendingUp, TrendingDown } from "lucide-react";

export default async function CaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const c = getOne(user, db.caseStudies, id);
  if (!c) notFound();
  const path = `/cases/${id}`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {c.kind === "success" ? (
              <Badge tone="green"><TrendingUp className="h-3 w-3" /> 成功事例</Badge>
            ) : (
              <Badge tone="red"><TrendingDown className="h-3 w-3" /> 失敗事例</Badge>
            )}
            {c.companyName && <Badge tone="navy">{c.companyName}</Badge>}
            {c.industry && <Badge>{c.industry}</Badge>}
          </div>
          <h1 className="mt-2 text-xl font-bold text-navy">{c.title}</h1>
          <div className="mt-2">
            <TrustBadges e={c} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <FavoriteButton entityType="case" entityId={c.id} path={path} initial={isFavorite(user.id, "case", c.id)} />
          <StatusActions entityType="case" entityId={c.id} status={c.status} path={path} canApprove={canApprove(user)} canEdit={canEdit(user)} />
        </div>
      </div>

      <Card>
        <CardBody>
          <Tabs
            tabs={[
              {
                key: "story",
                label: "経緯",
                content: (
                  <div className="space-y-1">
                    <Field label="当時の状況">{c.situation}</Field>
                    <Field label="目標">{c.goal}</Field>
                    <Field label="実施施策">{c.actions}</Field>
                    <Field label="結果">{c.result}</Field>
                    <Field label="数値成果">{c.metrics}</Field>
                  </div>
                ),
              },
              {
                key: "factors",
                label: "要因分析",
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-green-50/50 p-3">
                      <div className="mb-1 text-sm font-semibold text-success">成功要因</div>
                      <BulletList items={c.successFactors} />
                    </div>
                    <div className="rounded-lg bg-red-50/50 p-3">
                      <div className="mb-1 text-sm font-semibold text-danger">失敗要因</div>
                      <BulletList items={c.failureFactors} />
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">見落としていた前提</div>
                      <div className="mt-1"><BulletList items={c.overlookedAssumptions} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">問題発生の兆候</div>
                      <div className="mt-1"><BulletList items={c.warningSigns} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-warning">早期警戒指標</div>
                      <div className="mt-1"><BulletList items={c.earlyIndicators} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-success">再発防止策</div>
                      <div className="mt-1"><BulletList items={c.preventionMeasures} /></div>
                    </div>
                  </div>
                ),
              },
              {
                key: "implication",
                label: "自社への示唆",
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-navy-50/50 p-3">
                      <div className="mb-1 text-sm font-semibold text-navy">ABENGERSへの示唆</div>
                      <p className="text-sm text-ink">{c.abengersImplication ?? "—"}</p>
                    </div>
                    <div className="rounded-lg bg-gold/5 p-3">
                      <div className="mb-1 text-sm font-semibold text-gold-dark">コエニへの示唆</div>
                      <p className="text-sm text-ink">{c.koeniImplication ?? "—"}</p>
                    </div>
                    <Field label="他事業への応用">{c.otherApplications}</Field>
                    <Field label="出典"><BulletList items={c.sources} /></Field>
                  </div>
                ),
              },
              {
                key: "comments",
                label: "コメント",
                content: <CommentSection entityType="case" entityId={c.id} path={path} />,
              },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
