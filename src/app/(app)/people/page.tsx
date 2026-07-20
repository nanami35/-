import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { q } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { TrustBadges } from "@/components/trust-badges";

export default async function PeoplePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const people = await q.people(user);

  return (
    <div>
      <PageHeader title="経営者・人物図鑑" description="経営者の哲学・意思決定の特徴・失敗経験を蓄積し、学びを抽出します。" />
      {people.length === 0 ? (
        <EmptyState title="人物情報がありません" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <Link key={p.id} href={`/people/${p.id}`}>
              <Card className="h-full transition-shadow hover:shadow-panel">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-gold">
                      {p.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-semibold text-navy">{p.name}</div>
                      <div className="text-xs text-muted">{p.companyName}・{p.title}</div>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted">{p.philosophy}</p>
                  <div className="mt-3"><TrustBadges e={p} /></div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
