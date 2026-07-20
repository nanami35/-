import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isFavorite, q } from "@/lib/queries";
import { Card, CardBody } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Field, BulletList } from "@/components/ui/page";
import { TrustBadges } from "@/components/trust-badges";
import { FavoriteButton } from "@/components/interactive";
import { CommentSection } from "@/components/comment-section";
import { TRISTATE_LABELS } from "@/lib/labels";

export default async function BusinessModelDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const m = await q.getBusinessModel(user, id);
  if (!m) notFound();
  const path = `/business-models/${id}`;

  const companies = (await q.companies(user)).filter((c) => m.representativeCompanyIds?.includes(c.id));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">{m.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{m.definition}</p>
          <div className="mt-2">
            <TrustBadges e={m} />
          </div>
        </div>
        <FavoriteButton entityType="business_model" entityId={m.id} path={path} initial={isFavorite(user.id, "business_model", m.id)} />
      </div>

      <Card>
        <CardBody>
          <Tabs
            tabs={[
              {
                key: "def",
                label: "定義・提供価値",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <Field label="対象顧客">{m.targetCustomer}</Field>
                    <Field label="顧客課題">{m.customerProblem}</Field>
                    <Field label="提供価値">{m.valueProposition}</Field>
                    <Field label="支援範囲">{m.supportScope}</Field>
                    <Field label="料金体系">{m.pricingModel}</Field>
                    <Field label="経営責任">{m.managementResponsibility}</Field>
                    <div className="col-span-2 py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">収益源</div>
                      <div className="mt-1"><BulletList items={m.revenueSources} /></div>
                    </div>
                  </div>
                ),
              },
              {
                key: "attrs",
                label: "モデル属性",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-3">
                    <Field label="出資">{m.investment && TRISTATE_LABELS[m.investment]}</Field>
                    <Field label="株式保有">{m.equityHolding && TRISTATE_LABELS[m.equityHolding]}</Field>
                    <Field label="CXO派遣">{m.cxoDispatch && TRISTATE_LABELS[m.cxoDispatch]}</Field>
                    <Field label="実務支援">{m.handsOnSupport && TRISTATE_LABELS[m.handsOnSupport]}</Field>
                    <Field label="成果報酬">{m.performanceFee && TRISTATE_LABELS[m.performanceFee]}</Field>
                    <Field label="EXIT">{m.exit && TRISTATE_LABELS[m.exit]}</Field>
                    <Field label="利益率">{m.profitMargin}</Field>
                    <Field label="継続性">{m.continuity}</Field>
                    <Field label="再現性">{m.reproducibility}</Field>
                    <Field label="拡張性">{m.scalability}</Field>
                    <div className="col-span-3 py-2">
                      <div className="text-[11px] font-medium uppercase text-danger">主なリスク</div>
                      <div className="mt-1"><BulletList items={m.mainRisks} /></div>
                    </div>
                  </div>
                ),
              },
              {
                key: "compare",
                label: "ABENGERS/コエニとの異同",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <div className="rounded-lg bg-navy-50/50 p-3">
                      <div className="mb-1 text-sm font-semibold text-navy">ABENGERSとの共通点</div>
                      <BulletList items={m.commonWithAbengers} />
                    </div>
                    <div className="rounded-lg bg-gold/5 p-3">
                      <div className="mb-1 text-sm font-semibold text-gold-dark">ABENGERSとの違い</div>
                      <BulletList items={m.diffFromAbengers} />
                    </div>
                    <div className="mt-3 rounded-lg bg-navy-50/50 p-3">
                      <div className="mb-1 text-sm font-semibold text-navy">コエニとの共通点</div>
                      <BulletList items={m.commonWithKoeni} />
                    </div>
                    <div className="mt-3 rounded-lg bg-gold/5 p-3">
                      <div className="mb-1 text-sm font-semibold text-gold-dark">コエニとの違い</div>
                      <BulletList items={m.diffFromKoeni} />
                    </div>
                  </div>
                ),
              },
              {
                key: "companies",
                label: "代表企業",
                content:
                  companies.length === 0 ? (
                    <p className="text-sm text-muted">—</p>
                  ) : (
                    <ul className="space-y-1">
                      {companies.map((c) => (
                        <li key={c.id}>
                          <Link href={`/companies/${c.id}`} className="text-sm text-info hover:underline">
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ),
              },
              {
                key: "comments",
                label: "コメント",
                content: <CommentSection entityType="business_model" entityId={m.id} path={path} />,
              },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
