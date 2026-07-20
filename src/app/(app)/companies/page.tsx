import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canEdit } from "@/lib/rbac";
import { q } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { categoryLabel } from "@/lib/labels";
import { Plus } from "lucide-react";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; kw?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { category, kw } = await searchParams;

  const allCompanies = await q.companies(user);
  let companies = allCompanies;
  if (category) companies = companies.filter((c) => c.category === category);
  if (kw) {
    const k = kw.toLowerCase();
    companies = companies.filter(
      (c) => c.name.toLowerCase().includes(k) || (c.industry ?? "").toLowerCase().includes(k),
    );
  }

  const totalCount = allCompanies.length;
  const categories = Array.from(new Set(allCompanies.map((c) => c.category)));

  return (
    <div>
      <PageHeader
        title="企業図鑑"
        description="ベンチマーク企業・自社グループの事業モデルと経営分析を一元管理します。"
        actions={
          canEdit(user) && (
            <Link href="/companies/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                企業を登録
              </Button>
            </Link>
          )
        }
      />

      {/* カテゴリフィルタ */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/companies">
          <Badge tone={!category ? "navy" : "gray"}>すべて({totalCount})</Badge>
        </Link>
        {categories.map((c) => (
          <Link key={c} href={`/companies?category=${c}`}>
            <Badge tone={category === c ? "navy" : "gray"}>{categoryLabel(c)}</Badge>
          </Link>
        ))}
      </div>

      {companies.length === 0 ? (
        <EmptyState title="該当する企業がありません" description="フィルタ条件を変更するか、新しい企業を登録してください。" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`}>
              <Card className="h-full transition-shadow hover:shadow-panel">
                <CardBody>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-700 text-sm font-bold text-gold">
                      {c.logoText}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-navy">{c.name}</div>
                      <div className="truncate text-xs text-muted">{c.industry}</div>
                      <div className="mt-1">
                        <Badge tone="navy">{categoryLabel(c.category)}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-muted">
                    {c.businessModel.valueProposition ?? "—"}
                  </p>
                  <div className="mt-3">
                    <TrustBadges e={c} />
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
