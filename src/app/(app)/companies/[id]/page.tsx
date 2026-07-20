import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { canApprove, canEdit } from "@/lib/rbac";
import { isFavorite, q } from "@/lib/queries";
import { Card, CardBody } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Field, BulletList } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { FavoriteButton, StatusActions } from "@/components/interactive";
import { CommentSection } from "@/components/comment-section";
import { categoryLabel, TRISTATE_LABELS } from "@/lib/labels";
import { ExternalLink } from "lucide-react";

export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const c = await q.getCompany(user, id);
  if (!c) notFound();

  const path = `/companies/${id}`;
  const bm = c.businessModel;
  const an = c.analysis;
  const ap = c.application;

  const relatedCases = (await q.cases(user)).filter((cs) => cs.companyId === c.id);
  const relatedKnowledge = (await q.knowledge(user)).filter((k) => k.relatedCompanyIds?.includes(c.id));

  const yn = (v?: boolean) => (v === undefined ? "不明" : v ? "あり" : "なし");

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-700 text-lg font-bold text-gold">
            {c.logoText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-navy">{c.name}</h1>
              {c.website && (
                <a href={c.website} target="_blank" rel="noreferrer" className="text-muted hover:text-info">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted">
              {c.nameKana && `${c.nameKana}・`}
              {c.industry}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge tone="navy">{categoryLabel(c.category)}</Badge>
              <TrustBadges e={c} />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <FavoriteButton entityType="company" entityId={c.id} path={path} initial={isFavorite(user.id, "company", c.id)} />
          </div>
          <StatusActions
            entityType="company"
            entityId={c.id}
            status={c.status}
            path={path}
            canApprove={canApprove(user)}
            canEdit={canEdit(user)}
          />
        </div>
      </div>

      <Card>
        <CardBody>
          <Tabs
            tabs={[
              {
                key: "overview",
                label: "概要",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <Field label="企業名(カナ)">{c.nameKana}</Field>
                    <Field label="英語名">{c.nameEn}</Field>
                    <Field label="設立年">{c.foundedYear}</Field>
                    <Field label="代表者">{c.representative}</Field>
                    <Field label="創業者">{c.founder}</Field>
                    <Field label="所在地">{c.location}</Field>
                    <Field label="従業員数">{c.employees}</Field>
                    <Field label="売上">{c.revenue}</Field>
                    <Field label="上場区分">{c.listingStatus}</Field>
                    <Field label="証券コード">{c.tickerCode}</Field>
                    <Field label="業界">{c.industry}</Field>
                    <Field label="情報取得日">{c.sourceObtainedAt}</Field>
                    <Field label="最終確認日">{c.lastVerifiedAt}</Field>
                    <Field label="次回確認期限">{c.nextReviewAt}</Field>
                    {c.tags && c.tags.length > 0 && (
                      <div className="col-span-2 py-2">
                        <div className="text-[11px] font-medium uppercase text-muted">タグ</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {c.tags.map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "business",
                label: "ビジネスモデル",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <Field label="対象顧客">{bm.targetCustomer}</Field>
                    <Field label="顧客課題">{bm.customerProblem}</Field>
                    <Field label="提供価値">{bm.valueProposition}</Field>
                    <Field label="商品・サービス">{bm.products}</Field>
                    <Field label="価格">{bm.pricing}</Field>
                    <Field label="販売方法">{bm.salesMethod}</Field>
                    <Field label="収益モデル">{bm.revenueModel}</Field>
                    <Field label="コスト構造">{bm.costStructure}</Field>
                    <Field label="成長モデル">{bm.growthModel}</Field>
                    <Field label="競争優位性">{bm.competitiveEdge}</Field>
                    <Field label="支援範囲">{bm.supportScope}</Field>
                    <Field label="経営責任の範囲">{bm.managementScope}</Field>
                    <Field label="出資の有無">{yn(bm.hasInvestment)}</Field>
                    <Field label="人材派遣の有無">{yn(bm.hasStaffing)}</Field>
                    <Field label="成果報酬の有無">{yn(bm.hasPerformanceFee)}</Field>
                    <Field label="EXITの有無">{yn(bm.hasExit)}</Field>
                  </div>
                ),
              },
              {
                key: "analysis",
                label: "経営分析",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <Field label="成長のセンターピン">{an.centerPin}</Field>
                    <Field label="組織構造">{an.orgStructure}</Field>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">成功要因</div>
                      <div className="mt-1"><BulletList items={an.successFactors} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">KPI</div>
                      <div className="mt-1"><BulletList items={an.kpis} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">強み</div>
                      <div className="mt-1"><BulletList items={an.strengths} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">弱み</div>
                      <div className="mt-1"><BulletList items={an.weaknesses} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">リスク</div>
                      <div className="mt-1"><BulletList items={an.risks} /></div>
                    </div>
                    <Field label="今後の展望">{an.outlook}</Field>
                  </div>
                ),
              },
              {
                key: "successfail",
                label: "成功・失敗",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <div className="rounded-lg bg-green-50/50 p-3">
                      <div className="mb-1 text-sm font-semibold text-success">成功要因</div>
                      <BulletList items={an.successFactors} />
                    </div>
                    <div className="rounded-lg bg-red-50/50 p-3">
                      <div className="mb-1 text-sm font-semibold text-danger">失敗要因</div>
                      <BulletList items={an.failureFactors} />
                    </div>
                  </div>
                ),
              },
              {
                key: "application",
                label: "自社への応用",
                content: (
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">ABENGERSが学ぶべき点</div>
                      <div className="mt-1"><BulletList items={ap.abengersLearnings} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">コエニが学ぶべき点</div>
                      <div className="mt-1"><BulletList items={ap.koeniLearnings} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-muted">模倣可能な仕組み</div>
                      <div className="mt-1"><BulletList items={ap.copyableMechanisms} /></div>
                    </div>
                    <div className="py-2">
                      <div className="text-[11px] font-medium uppercase text-danger">模倣してはいけない点</div>
                      <div className="mt-1"><BulletList items={ap.avoidPoints} /></div>
                    </div>
                    <Field label="ABENGERSとの違い">{ap.diffFromAbengers}</Field>
                    <Field label="コエニとの違い">{ap.diffFromKoeni}</Field>
                    <Field label="優先度">{ap.priority && ({ high: "高", medium: "中", low: "低" }[ap.priority])}</Field>
                    <Field label="実行状況">{ap.executionStatus}</Field>
                  </div>
                ),
              },
              {
                key: "related",
                label: "関連情報",
                content: (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-navy">関連事例</div>
                      {relatedCases.length === 0 ? (
                        <p className="text-sm text-muted">—</p>
                      ) : (
                        <ul className="space-y-1">
                          {relatedCases.map((cs) => (
                            <li key={cs.id}>
                              <Link href={`/cases/${cs.id}`} className="text-sm text-info hover:underline">
                                {cs.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-semibold text-navy">関連ノウハウ</div>
                      {relatedKnowledge.length === 0 ? (
                        <p className="text-sm text-muted">—</p>
                      ) : (
                        <ul className="space-y-1">
                          {relatedKnowledge.map((k) => (
                            <li key={k.id}>
                              <Link href={`/knowledge/${k.id}`} className="text-sm text-info hover:underline">
                                {k.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "history",
                label: "更新履歴",
                content: (
                  <div className="space-y-2 text-sm">
                    <Field label="作成日時">{c.createdAt.slice(0, 16).replace("T", " ")}</Field>
                    <Field label="更新日時">{c.updatedAt.slice(0, 16).replace("T", " ")}</Field>
                    <Field label="最終確認日">{c.lastVerifiedAt}</Field>
                    <p className="pt-2 text-xs text-muted">
                      ※ 変更前後の差分表示は「更新履歴」画面で確認できます。
                    </p>
                  </div>
                ),
              },
              {
                key: "comments",
                label: "コメント",
                content: <CommentSection entityType="company" entityId={c.id} path={path} />,
              },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
