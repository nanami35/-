import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { search } from "@/lib/search";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge, CertaintyBadge } from "@/components/trust-badges";
import type { EntityType } from "@/lib/types";
import { Search as SearchIcon, Sparkles } from "lucide-react";

const TYPE_LABELS: Record<EntityType, string> = {
  company: "企業",
  person: "人物",
  business_model: "ビジネスモデル",
  knowledge: "ノウハウ",
  case: "事例",
  project: "プロジェクト",
  meeting: "会議記録",
  source: "情報ソース",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { q: query = "", type } = await searchParams;

  const results = query
    ? search(user, query, {
        entityTypes: type ? [type as EntityType] : undefined,
        limit: 60,
      })
    : [];

  return (
    <div>
      <PageHeader title="全体検索" description="企業・ノウハウ・事例・人物・プロジェクトなどを横断検索します。" />

      <form className="mb-4" method="GET">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="キーワード / 自然文で検索(例:FC本部構築で参考になる企業)"
            className="h-12 w-full rounded-xl border border-navy-100 bg-white pl-11 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
          />
        </div>
      </form>

      {query && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Link href={`/search?q=${encodeURIComponent(query)}`}>
            <Badge tone={!type ? "navy" : "gray"}>すべて({results.length})</Badge>
          </Link>
          {(Object.keys(TYPE_LABELS) as EntityType[]).map((t) => (
            <Link key={t} href={`/search?q=${encodeURIComponent(query)}&type=${t}`}>
              <Badge tone={type === t ? "navy" : "gray"}>{TYPE_LABELS[t]}</Badge>
            </Link>
          ))}
          <Link href={`/chat?q=${encodeURIComponent(query)}`} className="ml-auto">
            <Badge tone="gold">
              <Sparkles className="h-3 w-3" /> この質問をAIに聞く
            </Badge>
          </Link>
        </div>
      )}

      {!query ? (
        <EmptyState title="キーワードを入力してください" description="信頼度・確定度つきで、権限のある情報のみが検索対象になります。" />
      ) : results.length === 0 ? (
        <EmptyState title="該当する情報が見つかりませんでした" description="別のキーワードをお試しください。" />
      ) : (
        <div className="space-y-2">
          {results.map(({ doc }) => (
            <Link key={`${doc.entityType}-${doc.id}`} href={doc.href}>
              <Card className="transition-shadow hover:shadow-panel">
                <CardBody className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="navy">{TYPE_LABELS[doc.entityType]}</Badge>
                      <span className="truncate font-medium text-navy">{doc.title}</span>
                      {doc.isInternal ? (
                        <Badge tone="blue">社内</Badge>
                      ) : (
                        <Badge tone="gray">外部</Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">{doc.text.slice(0, 120)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <ConfidenceBadge level={doc.confidenceLevel} />
                    <CertaintyBadge level={doc.certaintyLevel} />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
