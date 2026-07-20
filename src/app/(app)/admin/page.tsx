import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin, ROLE_LABELS, VISIBILITY_LABELS } from "@/lib/rbac";
import { db } from "@/lib/store";
import { resolveProvider } from "@/lib/ai/provider";
import { PageHeader } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, ShieldCheck, Sparkles, Settings } from "lucide-react";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/dashboard");

  const provider = resolveProvider();

  return (
    <div>
      <PageHeader title="管理コンソール" description="ユーザー・組織・権限・AI・システム設定を管理します。" />
      <Card>
        <CardBody>
          <Tabs
            tabs={[
              {
                key: "users",
                label: "ユーザー管理",
                content: (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-navy-100 text-left text-xs text-muted">
                          <th className="py-2">氏名</th>
                          <th className="py-2">メール</th>
                          <th className="py-2">所属</th>
                          <th className="py-2">ロール</th>
                          <th className="py-2">属性</th>
                        </tr>
                      </thead>
                      <tbody>
                        {db.users.map((u) => {
                          const org = db.organizations.find((o) => o.id === u.organizationId);
                          return (
                            <tr key={u.id} className="border-b border-navy-100/40">
                              <td className="py-2.5 font-medium text-navy">{u.name}</td>
                              <td className="py-2.5 font-mono text-xs">{u.email}</td>
                              <td className="py-2.5">{org?.name}</td>
                              <td className="py-2.5"><Badge tone="navy">{ROLE_LABELS[u.role]}</Badge></td>
                              <td className="py-2.5 text-xs text-muted">
                                {u.isExecutive && "役員 "}
                                {u.isManager && "管理職"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="mt-3 text-xs text-muted">※ 招待制ユーザー登録・ロール編集は本番でSupabase Authと連携します。</p>
                  </div>
                ),
              },
              {
                key: "orgs",
                label: "組織管理",
                content: (
                  <div className="space-y-2">
                    {db.organizations.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-lg border border-navy-100/60 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-navy" />
                          <span className="font-medium text-navy">{o.name}</span>
                          <Badge tone="gray">{o.kind === "group" ? "グループ" : "企業"}</Badge>
                        </div>
                        <span className="text-xs text-muted">
                          所属メンバー: {db.users.filter((u) => u.organizationId === o.id).length}名
                        </span>
                      </div>
                    ))}
                    <p className="mt-2 text-xs text-muted">※ 企業・所属組織は今後追加できる設計です(要件3)。</p>
                  </div>
                ),
              },
              {
                key: "roles",
                label: "権限管理",
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy">
                        <ShieldCheck className="h-4 w-4" /> ロール一覧
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.values(ROLE_LABELS).map((r) => (
                          <Badge key={r} tone="navy">{r}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-semibold text-navy">閲覧範囲</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.values(VISIBILITY_LABELS).map((v) => (
                          <Badge key={v} tone="gray">{v}</Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted sm:col-span-2">
                      ※ 権限はフロント表示だけでなくデータ取得層(RLS相当)で強制されます(要件10/18)。
                    </p>
                  </div>
                ),
              },
              {
                key: "ai",
                label: "AI設定",
                content: (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <span className="text-sm">現在のAIプロバイダー:</span>
                      <Badge tone={provider === "mock" ? "gray" : "green"}>{provider}</Badge>
                    </div>
                    <p className="text-sm text-muted">
                      環境変数 <code className="rounded bg-canvas px-1">AI_PROVIDER</code> で mock / openai / anthropic / gemini を切り替えます。
                      APIキー未設定時は自動的にモックへフォールバックし、AI以外の機能は常時動作します(要件19)。
                    </p>
                    <ul className="list-disc pl-5 text-sm text-ink">
                      <li>要約・タグ付け・分類・エンティティ抽出</li>
                      <li>比較表生成・自社への応用案</li>
                      <li>重複検出・矛盾検出</li>
                      <li>RAG検索・質問回答(出典付き)</li>
                    </ul>
                  </div>
                ),
              },
              {
                key: "system",
                label: "システム設定",
                content: (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted" />
                      <span>データソース:</span>
                      <Badge tone="navy">{process.env.DATA_SOURCE ?? "seed"}</Badge>
                    </div>
                    <p className="text-muted">
                      DATA_SOURCE=seed でインメモリ起動(外部DB不要)。DATA_SOURCE=supabase で PostgreSQL + RLS + pgvector に接続する構成です(要件13/14/15)。
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
