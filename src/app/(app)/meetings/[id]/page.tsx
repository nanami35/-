import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOne } from "@/lib/queries";
import { db } from "@/lib/store";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { CommentSection } from "@/components/comment-section";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default async function MeetingDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const m = getOne(user, db.meetings, id);
  if (!m) notFound();
  const path = `/meetings/${id}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy">{m.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {m.heldAt?.slice(0, 16).replace("T", " ")}｜参加者: {m.participants?.join("、")}
        </p>
        <div className="mt-2"><TrustBadges e={m} /></div>
      </div>

      {m.aiSummary && (
        <Card>
          <CardHeader title={<span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-gold" />AI要約</span>} />
          <CardBody><p className="text-sm text-ink">{m.aiSummary}</p></CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="議題・議事録" />
        <CardBody>
          <Field label="議題">{m.agenda}</Field>
          <Field label="議事録">{m.minutes}</Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="決定事項と意思決定の記録" />
        <CardBody className="space-y-3">
          {(m.decisions ?? []).map((d) => (
            <div key={d.id} className="rounded-lg border border-navy-100/60 bg-canvas p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                <div>
                  <div className="text-sm font-semibold text-navy">{d.content}</div>
                  <div className="mt-1 grid gap-1 text-xs text-muted sm:grid-cols-2">
                    <div><span className="font-medium">決定理由:</span> {d.reason}</div>
                    <div><span className="font-medium">採用しなかった案:</span> {d.rejectedAlternatives}</div>
                    <div className="sm:col-span-2"><span className="font-medium">前提条件:</span> {d.assumptions}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="アクションアイテム" />
        <CardBody className="space-y-2">
          {(m.actionItems ?? []).map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <span className="text-ink">{a.content}</span>
              <span className="flex items-center gap-2 text-xs text-muted">
                <Badge tone={a.done ? "green" : "gold"}>{a.done ? "完了" : "未完了"}</Badge>
                {a.owner}・{a.dueDate}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CommentSection entityType="meeting" entityId={m.id} path={path} />
        </CardBody>
      </Card>
    </div>
  );
}
