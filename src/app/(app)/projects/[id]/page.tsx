import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getOne, isFavorite, q } from "@/lib/queries";
import { db } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Field, BulletList } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { FavoriteButton } from "@/components/interactive";
import { CommentSection } from "@/components/comment-section";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const p = getOne(user, db.projects, id);
  if (!p) notFound();
  const path = `/projects/${id}`;

  const relatedKnowledge = q.knowledge(user).filter((k) => p.reusableKnowledgeIds?.includes(k.id));
  const relatedMeetings = q.meetings(user).filter((m) => m.projectId === p.id);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="navy">{p.projectType}</Badge>
            <Badge tone="gold">{p.projectStatus}</Badge>
          </div>
          <h1 className="mt-2 text-xl font-bold text-navy">{p.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {p.clientName}・{p.belongingCompany}・{p.industry}
          </p>
          <div className="mt-2">
            <TrustBadges e={p} />
          </div>
        </div>
        <FavoriteButton entityType="project" entityId={p.id} path={path} initial={isFavorite(user.id, "project", p.id)} />
      </div>

      <Card>
        <CardBody>
          <Tabs
            tabs={[
              {
                key: "overview",
                label: "概要",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <Field label="支援フェーズ">{p.supportPhase}</Field>
                    <Field label="期間">{p.startDate} 〜 {p.endDate}</Field>
                    <Field label="背景">{p.background}</Field>
                    <Field label="顧客課題">{p.customerProblem}</Field>
                    <Field label="目標">{p.goal}</Field>
                    <Field label="支援内容">{p.supportContent}</Field>
                    <Field label="現在の課題">{p.currentIssues}</Field>
                    <Field label="リスク">{p.risks}</Field>
                  </div>
                ),
              },
              {
                key: "kpi",
                label: "KPI・成果",
                content: (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-navy-100 text-left text-xs text-muted">
                            <th className="py-2">KPI</th>
                            <th className="py-2">目標</th>
                            <th className="py-2">現在</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(p.kpis ?? []).map((k, i) => (
                            <tr key={i} className="border-b border-navy-100/40">
                              <td className="py-2 font-medium text-navy">{k.label}</td>
                              <td className="py-2">{k.target}</td>
                              <td className="py-2">{k.current ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Field label="成果">{p.result}</Field>
                    <Field label="数値成果">{p.metrics}</Field>
                    <div>
                      <div className="text-[11px] font-medium uppercase text-muted">意思決定</div>
                      <div className="mt-1"><BulletList items={p.decisions} /></div>
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
                      <div className="mb-2 text-sm font-semibold text-navy">再利用できるノウハウ</div>
                      {relatedKnowledge.length === 0 ? <p className="text-sm text-muted">—</p> : (
                        <ul className="space-y-1">
                          {relatedKnowledge.map((k) => (
                            <li key={k.id}><Link href={`/knowledge/${k.id}`} className="text-sm text-info hover:underline">{k.title}</Link></li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-semibold text-navy">会議記録</div>
                      {relatedMeetings.length === 0 ? <p className="text-sm text-muted">—</p> : (
                        <ul className="space-y-1">
                          {relatedMeetings.map((m) => (
                            <li key={m.id}><Link href={`/meetings/${m.id}`} className="text-sm text-info hover:underline">{m.title}</Link></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "comments",
                label: "コメント",
                content: <CommentSection entityType="project" entityId={p.id} path={path} />,
              },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
