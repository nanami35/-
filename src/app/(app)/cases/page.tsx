import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { q } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { TrendingUp, TrendingDown } from "lucide-react";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { kind } = await searchParams;

  let cases = await q.cases(user);
  if (kind === "success" || kind === "failure") cases = cases.filter((c) => c.kind === kind);

  return (
    <div>
      <PageHeader
        title="成功・失敗事例データベース"
        description="早期警戒指標や再発防止策まで含め、成功と失敗の両方を資産化します。"
      />
      <div className="mb-4 flex gap-2">
        <Link href="/cases">
          <Badge tone={!kind ? "navy" : "gray"}>すべて</Badge>
        </Link>
        <Link href="/cases?kind=success">
          <Badge tone={kind === "success" ? "green" : "gray"}>成功事例</Badge>
        </Link>
        <Link href="/cases?kind=failure">
          <Badge tone={kind === "failure" ? "red" : "gray"}>失敗事例</Badge>
        </Link>
      </div>

      {cases.length === 0 ? (
        <EmptyState title="事例がありません" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cases.map((c) => (
            <Link key={c.id} href={`/cases/${c.id}`}>
              <Card className="h-full transition-shadow hover:shadow-panel">
                <CardBody>
                  <div className="flex items-center gap-2">
                    {c.kind === "success" ? (
                      <Badge tone="green">
                        <TrendingUp className="h-3 w-3" /> 成功事例
                      </Badge>
                    ) : (
                      <Badge tone="red">
                        <TrendingDown className="h-3 w-3" /> 失敗事例
                      </Badge>
                    )}
                    {c.industry && <Badge>{c.industry}</Badge>}
                  </div>
                  <div className="mt-2 font-semibold text-navy">{c.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{c.result ?? c.situation}</p>
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
