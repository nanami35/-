import Link from "next/link";
import { requireClientScope } from "@/lib/portal";
import { getReportsByStore } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import { formatMonth } from "@/lib/utils";

export default async function PortalReportsPage() {
  const { stores } = await requireClientScope();

  const perStore = await Promise.all(
    stores.map(async (s) => ({
      store: s,
      // クライアントには承認済み/共有済みのみ公開
      reports: (await getReportsByStore(s.id)).filter(
        (r) => r.status === "approved" || r.status === "shared"
      ),
    }))
  );
  const all = perStore.flatMap((p) => p.reports.map((r) => ({ report: r, store: p.store })));

  return (
    <div className="space-y-6">
      <PageHeader title="月次レポート" description="担当コンサルタントが作成・承認したレポートを確認できます。" />

      {all.length === 0 ? (
        <EmptyState
          title="公開されたレポートはまだありません"
          description="レポートが承認されると、ここに表示されます。"
        />
      ) : (
        <Card className="divide-y divide-border">
          {all.map(({ report, store }) => (
            <Link
              key={report.id}
              href={`/portal/reports/${report.id}`}
              className="flex items-center gap-3 p-4 hover:bg-navy-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy-800">{formatMonth(report.month + "-01")}のレポート</p>
                {stores.length > 1 && <p className="text-xs text-muted-foreground">{store.name}</p>}
              </div>
              <Badge tone="success">公開中</Badge>
              <span className="text-xs font-medium text-gold-600">開く →</span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
