import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireClientScope } from "@/lib/portal";
import { getReport, getStore } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PrintButton } from "@/components/reports/print-button";
import { REPORT_SECTIONS } from "@/lib/constants";
import { formatMonth } from "@/lib/utils";

export default async function PortalReportDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { stores } = await requireClientScope();
  const report = await getReport(id);

  // 自社店舗の、承認済み/共有済みレポートのみ閲覧可
  const storeIds = new Set(stores.map((s) => s.id));
  if (
    !report ||
    !storeIds.has(report.storeId) ||
    (report.status !== "approved" && report.status !== "shared")
  ) {
    notFound();
  }

  const store = await getStore(report.storeId);

  return (
    <div className="space-y-6">
      <Link href="/portal/reports" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> レポート一覧へ戻る
      </Link>

      <PageHeader
        title={`${formatMonth(report.month + "-01")} 月次レポート`}
        description={store?.name}
      >
        <PrintButton />
      </PageHeader>

      <div className="space-y-4">
        {REPORT_SECTIONS.map((section, i) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle>
                {i + 1}. {section}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-800">
                {report.sections[section] ?? "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
