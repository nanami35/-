import { LayoutTemplate } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  DIAGNOSIS_CATEGORIES,
  INITIATIVE_CATEGORIES,
  KPI_DEFINITIONS,
  KPI_CATEGORIES,
  REPORT_SECTIONS,
  type KpiCategory,
} from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { groupBy } from "@/lib/utils";

export default async function TemplatesPage() {
  const user = await requireUser();

  if (user.role !== "admin") {
    return (
      <div className="space-y-6">
        <PageHeader title="テンプレート管理" />
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            権限がありません（管理者のみ）
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpiByCategory = groupBy(KPI_DEFINITIONS, (k) => k.category);

  return (
    <div className="space-y-6">
      <PageHeader
        title="テンプレート管理"
        description="診断・施策・KPI・レポートのマスタ定義を管理します。これらは管理者が編集可能になる予定（本デモは閲覧のみ）。"
      >
        <Badge tone="muted">閲覧のみ</Badge>
      </PageHeader>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-navy-500" />
          <CardTitle>診断項目テンプレート</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DIAGNOSIS_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="mb-2 flex items-center gap-2">
                <Badge tone="navy">{cat.label}</Badge>
                <span className="text-xs text-muted-foreground">{cat.description}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <Badge key={item} tone="default">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>施策カテゴリ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {INITIATIVE_CATEGORIES.map((c) => (
                <Badge key={c} tone="default">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle>レポート構成</CardTitle>
            <Badge tone="muted">{REPORT_SECTIONS.length}セクション</Badge>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5 text-sm text-navy-800">
              {REPORT_SECTIONS.map((s, i) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-600">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>KPI定義</CardTitle>
          <Badge tone="muted">全{KPI_DEFINITIONS.length}項目</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(KPI_CATEGORIES) as KpiCategory[]).map((cat) => {
            const defs = kpiByCategory[cat] ?? [];
            if (defs.length === 0) return null;
            return (
              <div key={cat}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="gold">{KPI_CATEGORIES[cat]}</Badge>
                  <span className="text-xs text-muted-foreground">{defs.length}項目</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {defs.map((d) => (
                    <Badge key={d.key} tone="default">
                      {d.label}
                      <span className="ml-1 text-muted-foreground">({d.unit})</span>
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
