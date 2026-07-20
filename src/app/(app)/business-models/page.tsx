import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { q } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { Button } from "@/components/ui/button";
import { Table2 } from "lucide-react";

export default async function BusinessModelsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const models = await q.businessModels(user);

  return (
    <div>
      <PageHeader
        title="ビジネスモデル図鑑"
        description="支援モデルの定義・収益源・リスクを構造化し、ABENGERS/コエニとの異同を明示します。"
        actions={
          <Link href="/compare">
            <Button size="sm" variant="secondary">
              <Table2 className="h-4 w-4" />
              比較マトリクスで見る
            </Button>
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((m) => (
          <Link key={m.id} href={`/business-models/${m.id}`}>
            <Card className="h-full transition-shadow hover:shadow-panel">
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-navy">{m.name}</div>
                </div>
                <p className="mt-1.5 line-clamp-3 text-xs text-muted">{m.definition}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.investment === "yes" && <Badge tone="navy">出資</Badge>}
                  {m.cxoDispatch === "yes" && <Badge tone="navy">CXO派遣</Badge>}
                  {m.exit === "yes" && <Badge tone="navy">EXIT</Badge>}
                  {m.performanceFee === "yes" && <Badge tone="navy">成果報酬</Badge>}
                </div>
                <div className="mt-3">
                  <TrustBadges e={m} />
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
