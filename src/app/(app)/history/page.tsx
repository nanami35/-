import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/store";
import { userName } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon, GitCompare } from "lucide-react";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const logs = db.auditLogs
    .filter((l) => l.organizationId === user.organizationId)
    .filter((l) => l.action.startsWith("status.") || l.action.endsWith(".create") || l.action.endsWith(".update"))
    .slice(0, 40);

  return (
    <div>
      <PageHeader title="更新履歴・差分管理" description="情報の作成・更新・ステータス変更を追跡します。変更理由と変更前後を保持します(要件8-15)。" />

      {/* 差分表示のデモ */}
      <Card className="mb-5">
        <CardHeader title={<span className="flex items-center gap-1.5"><GitCompare className="h-4 w-4" />差分表示の例</span>} subtitle="更新前後の内容を視覚的に比較します。" />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-red-200 bg-red-50/40 p-3">
              <div className="mb-1 text-xs font-semibold text-danger">変更前</div>
              <p className="text-sm text-ink line-through decoration-danger/40">
                加盟開発は着手済み。2号店の検証は並行。
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50/40 p-3">
              <div className="mb-1 text-xs font-semibold text-success">変更後</div>
              <p className="text-sm text-ink">
                加盟開発は<strong className="text-success">2号店黒字化の検証後に開始</strong>する。
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">変更理由: ベンチャー・リンクの失敗事例(未検証モデルの販売)を踏まえた方針変更。</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={<span className="flex items-center gap-1.5"><HistoryIcon className="h-4 w-4" />変更ログ</span>} />
        <CardBody className="p-0">
          {logs.length === 0 ? (
            <div className="p-5"><EmptyState title="変更履歴がありません" /></div>
          ) : (
            <ul className="divide-y divide-navy-100/50">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge tone="navy">{l.action}</Badge>
                    <span className="text-ink">{l.detail ?? l.entityType}</span>
                  </div>
                  <span className="text-xs text-muted">
                    {userName(l.userId)}・{l.createdAt.slice(0, 16).replace("T", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
