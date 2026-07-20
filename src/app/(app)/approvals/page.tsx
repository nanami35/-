import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canApprove, canEdit } from "@/lib/rbac";
import { q } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/trust-badges";
import { StatusActions } from "@/components/interactive";

export default async function ApprovalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  type Row = { entityType: string; id: string; title: string; href: string; status: import("@/lib/types").Status };
  const rows: Row[] = [];
  q.companies(user).forEach((c) => c.status === "pending_review" && rows.push({ entityType: "company", id: c.id, title: c.name, href: `/companies/${c.id}`, status: c.status }));
  q.knowledge(user).forEach((k) => k.status === "pending_review" && rows.push({ entityType: "knowledge", id: k.id, title: k.title, href: `/knowledge/${k.id}`, status: k.status }));
  q.cases(user).forEach((c) => c.status === "pending_review" && rows.push({ entityType: "case", id: c.id, title: c.title, href: `/cases/${c.id}`, status: c.status }));

  const TYPE: Record<string, string> = { company: "企業", knowledge: "ノウハウ", case: "事例" };

  return (
    <div>
      <PageHeader
        title="承認待ち一覧"
        description="一般ユーザーが投稿した情報を、承認者が確認して公開します(要件8-14)。"
      />
      {!canApprove(user) && (
        <div className="mb-4 rounded-lg bg-gold/10 px-4 py-3 text-sm text-gold-dark ring-1 ring-inset ring-gold/30">
          あなたのロールでは承認操作はできません。承認者以上の権限が必要です。
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState title="承認待ちの情報はありません" />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={`${r.entityType}-${r.id}`}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge tone="navy">{TYPE[r.entityType]}</Badge>
                  <Link href={r.href} className="font-medium text-navy hover:underline">
                    {r.title}
                  </Link>
                  <StatusBadge status={r.status} />
                </div>
                <StatusActions
                  entityType={r.entityType}
                  entityId={r.id}
                  status={r.status}
                  path="/approvals"
                  canApprove={canApprove(user)}
                  canEdit={canEdit(user)}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
