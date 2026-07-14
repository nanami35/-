import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStores, getClient, getHearingByStore } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function HearingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; store?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const storeFilter = sp.store ?? "";

  let stores = getStores()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
  if (storeFilter) stores = stores.filter((s) => s.id === storeFilter);
  if (q) stores = stores.filter((s) => s.name.toLowerCase().includes(q));

  const storeOptions = getStores()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
    .map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="初回ヒアリング"
        description="店舗ごとの初回ヒアリング内容を管理します。"
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="店舗名で検索..." />
        <FilterSelect param="store" options={storeOptions} allLabel="すべての店舗" />
        <span className="ml-auto text-sm text-muted-foreground">{stores.length}件</span>
      </div>

      {stores.length === 0 ? (
        <EmptyState
          title="店舗が見つかりません"
          description="検索条件を変更してください。"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>店舗名</TH>
                  <TH>クライアント</TH>
                  <TH>ステータス</TH>
                  <TH>更新日</TH>
                  <TH className="text-right">操作</TH>
                </TR>
              </THead>
              <TBody>
                {stores.map((s) => {
                  const hearing = getHearingByStore(s.id);
                  const clientName = getClient(s.clientId)?.name ?? "—";
                  return (
                    <TR key={s.id}>
                      <TD>
                        {hearing ? (
                          <Link
                            href={`/hearings/${hearing.id}`}
                            className="font-medium text-navy-700 hover:text-gold-600 hover:underline"
                          >
                            {s.name}
                          </Link>
                        ) : (
                          <span className="font-medium text-navy-700">{s.name}</span>
                        )}
                      </TD>
                      <TD>{clientName}</TD>
                      <TD>
                        {!hearing ? (
                          <Badge tone="muted">未作成</Badge>
                        ) : hearing.status === "completed" ? (
                          <Badge tone="success">完了</Badge>
                        ) : (
                          <Badge tone="warning">下書き</Badge>
                        )}
                      </TD>
                      <TD className="whitespace-nowrap text-xs text-muted-foreground">
                        {hearing ? formatDate(hearing.updatedAt) : "—"}
                      </TD>
                      <TD className="text-right">
                        {hearing ? (
                          <Link
                            href={`/hearings/${hearing.id}`}
                            className="text-sm text-navy-600 hover:text-gold-600 hover:underline"
                          >
                            詳細
                          </Link>
                        ) : (
                          <Button variant="gold" size="sm">
                            <Plus className="h-4 w-4" />
                            作成
                          </Button>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
