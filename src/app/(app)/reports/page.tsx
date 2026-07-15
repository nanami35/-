import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReports, getStores, getStoreMap } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/status-badge";
import { formatDate, formatMonth } from "@/lib/utils";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const store = sp.store ?? "";

  let reports = await getReports();
  if (store) reports = reports.filter((r) => r.storeId === store);
  reports = reports.slice().sort((a, b) => b.month.localeCompare(a.month));

  const [storeList, storeMap] = await Promise.all([getStores(), getStoreMap()]);
  const storeOptions = storeList.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="月次レポート"
        description="店舗ごとの月次レポートを作成・共有します。"
      >
        <Button variant="gold" size="md">
          <Plus className="h-4 w-4" />
          新規レポート作成
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect param="store" options={storeOptions} allLabel="すべての店舗" />
        <span className="ml-auto text-sm text-muted-foreground">{reports.length}件</span>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="レポートが見つかりません"
          description="検索条件を変更するか、新規レポートを作成してください。"
          icon={<FileText className="h-6 w-6" />}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>店舗</TH>
                  <TH>対象月</TH>
                  <TH>ステータス</TH>
                  <TH>更新日</TH>
                  <TH className="text-right">操作</TH>
                </TR>
              </THead>
              <TBody>
                {reports.map((r) => (
                  <TR key={r.id}>
                    <TD className="font-medium text-navy-800">
                      {storeMap.get(r.storeId)?.name ?? "—"}
                    </TD>
                    <TD className="text-sm">{formatMonth(`${r.month}-01`)}</TD>
                    <TD>
                      <ReportStatusBadge value={r.status} />
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(r.updatedAt)}
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/reports/${r.id}`}
                        className="text-sm font-medium text-navy-700 hover:text-gold-600 hover:underline"
                      >
                        詳細
                      </Link>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
