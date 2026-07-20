import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { db } from "@/lib/store";
import { userName } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AuditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/dashboard");

  const logs = db.auditLogs
    .filter((l) => l.organizationId === user.organizationId)
    .slice(0, 100);

  return (
    <div>
      <PageHeader title="監査ログ" description="ログイン・作成・更新・承認・権限変更などの操作履歴を記録します(要件18)。" />
      {logs.length === 0 ? (
        <EmptyState title="監査ログがありません" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-xs text-muted">
                  <th className="px-5 py-2.5">日時</th>
                  <th className="px-5 py-2.5">ユーザー</th>
                  <th className="px-5 py-2.5">操作</th>
                  <th className="px-5 py-2.5">対象</th>
                  <th className="px-5 py-2.5">詳細</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-navy-100/40">
                    <td className="px-5 py-2.5 text-xs text-muted">{l.createdAt.slice(0, 19).replace("T", " ")}</td>
                    <td className="px-5 py-2.5">{userName(l.userId)}</td>
                    <td className="px-5 py-2.5"><Badge tone="navy">{l.action}</Badge></td>
                    <td className="px-5 py-2.5 text-xs">{l.entityType ? `${l.entityType}:${l.entityId ?? ""}` : "—"}</td>
                    <td className="px-5 py-2.5 text-xs text-muted">{l.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
