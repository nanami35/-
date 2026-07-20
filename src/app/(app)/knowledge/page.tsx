import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canEdit } from "@/lib/rbac";
import { q } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustBadges } from "@/components/trust-badges";
import { IMPORTANCE_LABELS } from "@/lib/labels";
import { Plus } from "lucide-react";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { category } = await searchParams;

  const allArticles = await q.knowledge(user);
  let articles = allArticles;
  if (category) articles = articles.filter((a) => a.category === category);
  const categories = Array.from(new Set(allArticles.map((a) => a.category)));

  return (
    <div>
      <PageHeader
        title="ノウハウライブラリ"
        description="経営・マーケティング・FC・組織など、実践知を蓄積・再利用します。"
        actions={
          canEdit(user) && (
            <Link href="/knowledge/new">
              <Button size="sm">
                <Plus className="h-4 w-4" /> ノウハウを登録
              </Button>
            </Link>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/knowledge">
          <Badge tone={!category ? "navy" : "gray"}>すべて</Badge>
        </Link>
        {categories.map((c) => (
          <Link key={c} href={`/knowledge?category=${encodeURIComponent(c)}`}>
            <Badge tone={category === c ? "navy" : "gray"}>{c}</Badge>
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <EmptyState title="ノウハウがありません" />
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/knowledge/${a.id}`}>
              <Card className="transition-shadow hover:shadow-panel">
                <CardBody className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="navy">{a.category}</Badge>
                      {a.importance && (
                        <Badge tone={a.importance === "high" ? "gold" : "gray"}>
                          重要度{IMPORTANCE_LABELS[a.importance]}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 font-semibold text-navy">{a.title}</div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{a.summary ?? a.conclusion}</p>
                  </div>
                  <div className="shrink-0">
                    <TrustBadges e={a} />
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
