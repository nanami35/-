import { BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getKnowledgeCases } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; tag?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const all = await getKnowledgeCases();

  const businessTypes = Array.from(new Set(all.map((c) => c.businessType)));
  const tags = Array.from(new Set(all.flatMap((c) => c.tags)));

  const q = sp.q?.trim().toLowerCase();
  let cases = all;
  if (q)
    cases = cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.issue?.toLowerCase().includes(q) ?? false)
    );
  if (sp.type) cases = cases.filter((c) => c.businessType === sp.type);
  if (sp.tag) cases = cases.filter((c) => c.tags.includes(sp.tag!));

  return (
    <div className="space-y-6">
      <PageHeader
        title="ナレッジ・成功事例"
        description="業態・課題・施策・成果で成功事例を検索し、再現性のある打ち手を蓄積します。"
      >
        <SearchInput placeholder="タイトル・課題で検索..." />
        <FilterSelect
          param="type"
          options={businessTypes.map((t) => ({ value: t, label: t }))}
          allLabel="全業態"
        />
        <FilterSelect
          param="tag"
          options={tags.map((t) => ({ value: t, label: t }))}
          allLabel="全タグ"
        />
      </PageHeader>

      {cases.length === 0 ? (
        <EmptyState
          title="該当する事例がありません"
          description="検索条件を変更してください。"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardHeader className="gap-2">
                <div className="flex items-start gap-2">
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
                  <CardTitle className="text-sm leading-snug">{c.title}</CardTitle>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="navy">{c.businessType}</Badge>
                  {c.tags.map((t) => (
                    <Badge key={t} tone="gold">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">課題</p>
                  <p className="text-navy-800">{c.issue ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">実施施策</p>
                  <p className="text-navy-800">{c.initiative ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-gold-200 bg-gold-50/60 p-2.5">
                  <p className="text-xs font-medium text-gold-700">成果</p>
                  <p className="text-navy-800">{c.result ?? "—"}</p>
                </div>
                {(c.beforeMetrics || c.afterMetrics) && (
                  <p className="text-xs text-muted-foreground">
                    施策前: {c.beforeMetrics ?? "—"} → 施策後: {c.afterMetrics ?? "—"}
                  </p>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">成功要因</p>
                  <p className="text-navy-800">{c.successFactors ?? "—"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
