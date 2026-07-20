import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isFavorite, q } from "@/lib/queries";
import { Card, CardBody } from "@/components/ui/card";
import { Field, BulletList } from "@/components/ui/page";
import { TrustBadges } from "@/components/trust-badges";
import { FavoriteButton } from "@/components/interactive";

export default async function PersonDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const p = await q.getPerson(user, id);
  if (!p) notFound();
  const path = `/people/${id}`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-700 text-lg font-bold text-gold">
            {p.name.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">{p.name}</h1>
            <p className="text-sm text-muted">{p.companyName}・{p.title}</p>
            <div className="mt-2"><TrustBadges e={p} /></div>
          </div>
        </div>
        <FavoriteButton entityType="person" entityId={p.id} path={path} initial={isFavorite(user.id, "person", p.id)} />
      </div>

      <Card>
        <CardBody className="grid gap-x-8 sm:grid-cols-2">
          <Field label="経歴">{p.career}</Field>
          <Field label="経営哲学">{p.philosophy}</Field>
          <Field label="意思決定の特徴">{p.decisionStyle}</Field>
          <div className="py-2">
            <div className="text-[11px] font-medium uppercase text-muted">強み</div>
            <div className="mt-1"><BulletList items={p.strengths} /></div>
          </div>
          <div className="py-2">
            <div className="text-[11px] font-medium uppercase text-muted">実績</div>
            <div className="mt-1"><BulletList items={p.achievements} /></div>
          </div>
          <div className="py-2">
            <div className="text-[11px] font-medium uppercase text-muted">失敗経験</div>
            <div className="mt-1"><BulletList items={p.failures} /></div>
          </div>
          <div className="py-2 sm:col-span-2">
            <div className="text-[11px] font-medium uppercase text-muted">ABENGERSが学ぶべき点</div>
            <div className="mt-1"><BulletList items={p.abengersLearnings} /></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
