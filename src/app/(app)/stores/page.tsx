import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStores, getClients, getClientMap, getUserMap } from "@/lib/data";
import { SUPPORT_PHASES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const PHASE_OPTIONS = SUPPORT_PHASES.map((p) => ({ value: p, label: p }));

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; client?: string; phase?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const clientFilter = sp.client ?? "";
  const phaseFilter = sp.phase ?? "";

  const clients = await getClients();
  const clientOptions = clients
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
    .map((c) => ({ value: c.id, label: c.name }));

  const [clientMap, userMap] = await Promise.all([getClientMap(), getUserMap()]);

  let stores = await getStores();
  if (q) stores = stores.filter((s) => s.name.toLowerCase().includes(q));
  if (clientFilter) stores = stores.filter((s) => s.clientId === clientFilter);
  if (phaseFilter) stores = stores.filter((s) => s.phase === phaseFilter);
  stores = stores.slice().sort((a, b) => a.name.localeCompare(b.name, "ja"));

  return (
    <div className="space-y-6">
      <PageHeader title="店舗" description="支援中の各店舗の状況を管理します。">
        <Button variant="gold">
          <Plus className="h-4 w-4" />
          新規店舗
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="店舗名で検索..." />
        <FilterSelect param="client" options={clientOptions} allLabel="すべてのクライアント" />
        <FilterSelect param="phase" options={PHASE_OPTIONS} allLabel="すべてのフェーズ" />
        <span className="ml-auto text-sm text-muted-foreground">{stores.length}件</span>
      </div>

      {stores.length === 0 ? (
        <EmptyState
          title="店舗が見つかりません"
          description="検索条件を変更するか、新しい店舗を登録してください。"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>店舗名</TH>
                  <TH>クライアント</TH>
                  <TH>業態</TH>
                  <TH>ジャンル</TH>
                  <TH>フェーズ</TH>
                  <TH>担当</TH>
                  <TH className="text-right">月間売上</TH>
                  <TH className="text-right">客単価</TH>
                  <TH>次回MTG</TH>
                </TR>
              </THead>
              <TBody>
                {stores.map((s) => (
                  <TR key={s.id}>
                    <TD>
                      <Link
                        href={`/stores/${s.id}`}
                        className="font-medium text-navy-700 hover:text-gold-600 hover:underline"
                      >
                        {s.name}
                      </Link>
                    </TD>
                    <TD>{clientMap.get(s.clientId)?.name ?? "—"}</TD>
                    <TD>{s.businessType}</TD>
                    <TD>{s.genre}</TD>
                    <TD>
                      <Badge tone="info">{s.phase}</Badge>
                    </TD>
                    <TD>{userMap.get(s.consultantId)?.name ?? "未割当"}</TD>
                    <TD className="text-right">{formatCurrency(s.monthlySales)}</TD>
                    <TD className="text-right">{formatCurrency(s.avgSpend)}</TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(s.nextMeetingDate)}
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
