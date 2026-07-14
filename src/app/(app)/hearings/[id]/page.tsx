import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getHearings, getStore, getClient } from "@/lib/data";
import { HEARING_SECTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListItem } from "@/components/ui/data-list";

export default async function HearingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const hearing = getHearings().find((h) => h.id === id);
  if (!hearing) notFound();

  const store = getStore(hearing.storeId);
  const clientName = store ? getClient(store.clientId)?.name : undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/hearings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy-700"
      >
        <ArrowLeft className="h-4 w-4" />
        ヒアリング一覧に戻る
      </Link>

      <PageHeader
        title={store?.name ?? "店舗不明"}
        description={clientName ? `${clientName} の初回ヒアリング` : "初回ヒアリング"}
      >
        {hearing.status === "completed" ? (
          <Badge tone="success">完了</Badge>
        ) : (
          <Badge tone="warning">下書き</Badge>
        )}
      </PageHeader>

      <Card className="border-navy-200 bg-navy-50/40">
        <CardContent className="flex items-start gap-2 p-4 text-sm text-navy-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
          <p>ヒアリング内容は一時保存・更新が可能です（本デモでは閲覧のみ）。</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {HEARING_SECTIONS.map((section) => {
          const items: DataListItem[] = section.fields.map((field) => ({
            label: field.label,
            value: hearing.fields[field.key],
            full: true,
          }));
          return (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataList columns={1} items={items} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
