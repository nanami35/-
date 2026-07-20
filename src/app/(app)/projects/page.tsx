import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { q } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/trust-badges";
import { Lock } from "lucide-react";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const projects = await q.projects(user);

  return (
    <div>
      <PageHeader
        title="社内プロジェクト図鑑"
        description="支援実績を構造化し、再利用可能なノウハウ・テンプレートへ還元します。機密度に応じて閲覧制御されます。"
      />
      {projects.length === 0 ? (
        <EmptyState title="閲覧可能なプロジェクトがありません" description="プロジェクトメンバー限定の情報は、権限に応じて表示されます。" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="h-full transition-shadow hover:shadow-panel">
                <CardBody>
                  <div className="flex items-center gap-2">
                    <Badge tone="navy">{p.projectType}</Badge>
                    <Badge tone="gold">{p.projectStatus}</Badge>
                    {p.visibility === "project_members" && (
                      <Badge tone="gray"><Lock className="h-3 w-3" /> 限定</Badge>
                    )}
                  </div>
                  <div className="mt-2 font-semibold text-navy">{p.name}</div>
                  <p className="mt-1 text-sm text-muted">{p.clientName}・{p.industry}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{p.goal}</p>
                  <div className="mt-3">
                    <TrustBadges e={p} />
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
