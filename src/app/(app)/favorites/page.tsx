import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/store";
import { resolveEntity } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, History } from "lucide-react";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const favs = db.favorites
    .filter((f) => f.userId === user.id)
    .map((f) => ({ ...f, r: resolveEntity(f.entityType, f.entityId) }))
    .filter((f) => f.r);

  const seen = new Set<string>();
  const history = db.readingHistories
    .filter((h) => h.userId === user.id)
    .map((h) => ({ ...h, r: resolveEntity(h.entityType, h.entityId) }))
    .filter((h) => {
      if (!h.r) return false;
      const key = `${h.entityType}-${h.entityId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);

  return (
    <div>
      <PageHeader title="お気に入り・閲覧履歴" description="重要情報を保存し、最近見た情報にすばやくアクセスできます。" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title={<span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-gold" />お気に入り</span>} subtitle={`${favs.length}件`} />
          <CardBody className="space-y-2">
            {favs.length === 0 ? (
              <p className="text-sm text-muted">お気に入りはまだありません。</p>
            ) : (
              favs.map((f) => (
                <Link key={f.id} href={f.r!.href} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-navy-50/50">
                  <span className="text-sm text-navy">{f.r!.title}</span>
                  <Badge tone="navy">{f.r!.label}</Badge>
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-1.5"><History className="h-4 w-4 text-muted" />閲覧履歴</span>} subtitle="最近見た情報" />
          <CardBody className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-muted">閲覧履歴はありません。</p>
            ) : (
              history.map((h) => (
                <Link key={h.id} href={h.r!.href} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-navy-50/50">
                  <span className="text-sm text-navy">{h.r!.title}</span>
                  <span className="text-[11px] text-muted">{h.viewedAt.slice(0, 10)}</span>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
