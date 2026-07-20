import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { q } from "@/lib/queries";
import { db } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/trust-badges";
import { Rss, ExternalLink } from "lucide-react";

export default async function SourcesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sources = await q.sources(user);

  return (
    <div>
      <PageHeader title="情報ソース一覧" description="企業公式・IR・ニュース等の情報源を管理します。定期更新は将来自動化可能な構造です(要件8-16/8-17)。" />
      {sources.length === 0 ? (
        <EmptyState title="情報ソースがありません" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-xs text-muted">
                  <th className="px-5 py-2.5">ソース名</th>
                  <th className="px-5 py-2.5">種別</th>
                  <th className="px-5 py-2.5">更新頻度</th>
                  <th className="px-5 py-2.5">最終取得</th>
                  <th className="px-5 py-2.5">自動取得</th>
                  <th className="px-5 py-2.5">信頼度</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => {
                  const company = db.companies.find((c) => c.id === s.targetCompanyId);
                  return (
                    <tr key={s.id} className="border-b border-navy-100/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Rss className="h-4 w-4 text-muted" />
                          <span className="font-medium text-navy">{s.name}</span>
                          {s.url && (
                            <a href={s.url} target="_blank" rel="noreferrer" className="text-muted hover:text-info">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        {company && <div className="mt-0.5 text-xs text-muted">対象: {company.name}</div>}
                      </td>
                      <td className="px-5 py-3">{s.sourceType}</td>
                      <td className="px-5 py-3">{s.updateFrequency ?? "—"}</td>
                      <td className="px-5 py-3">{s.lastFetchedAt ?? "—"}</td>
                      <td className="px-5 py-3">
                        <Badge tone={s.autoFetch ? "green" : "gray"}>{s.autoFetch ? "自動" : "手動"}</Badge>
                      </td>
                      <td className="px-5 py-3"><ConfidenceBadge level={s.confidenceLevel} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
