import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getClients, getUserName, getStoresByClient } from "@/lib/data";
import { CONTRACT_STATUS, type ContractStatus } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ContractStatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(CONTRACT_STATUS).map(([value, label]) => ({
  value,
  label,
}));

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = sp.status ?? "";

  let clients = getClients();
  if (q) {
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        getUserName(c.consultantId).toLowerCase().includes(q)
    );
  }
  if (status) {
    clients = clients.filter((c) => c.contractStatus === (status as ContractStatus));
  }
  clients = clients
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  return (
    <div className="space-y-6">
      <PageHeader
        title="クライアント"
        description="契約中の企業と支援状況を管理します。"
      >
        <Button variant="gold">
          <Plus className="h-4 w-4" />
          新規クライアント
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="会社名・担当者で検索..." />
        <FilterSelect param="status" options={STATUS_OPTIONS} allLabel="すべての契約状況" />
        <span className="ml-auto text-sm text-muted-foreground">{clients.length}件</span>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="クライアントが見つかりません"
          description="検索条件を変更するか、新しいクライアントを登録してください。"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>会社名</TH>
                  <TH>担当コンサルタント</TH>
                  <TH>契約状況</TH>
                  <TH>プラン</TH>
                  <TH className="text-right">月額料金</TH>
                  <TH className="text-right">店舗数</TH>
                  <TH>契約期間</TH>
                </TR>
              </THead>
              <TBody>
                {clients.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <Link
                        href={`/clients/${c.id}`}
                        className="font-medium text-navy-700 hover:text-gold-600 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </TD>
                    <TD>{getUserName(c.consultantId)}</TD>
                    <TD>
                      <ContractStatusBadge value={c.contractStatus} />
                    </TD>
                    <TD>{c.plan ?? "—"}</TD>
                    <TD className="text-right">{formatCurrency(c.monthlyFee)}</TD>
                    <TD className="text-right">{getStoresByClient(c.id).length}</TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(c.contractStartDate)}〜{formatDate(c.contractEndDate)}
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
