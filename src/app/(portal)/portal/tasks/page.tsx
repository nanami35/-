import { requireClientScope } from "@/lib/portal";
import { getTasksByStore } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { TaskStatusBadge, PriorityBadge } from "@/components/status-badge";
import { formatDate, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function PortalTasksPage() {
  const { stores } = await requireClientScope();
  const nested = await Promise.all(stores.map((s) => getTasksByStore(s.id)));
  const tasks = nested.flat().sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  return (
    <div className="space-y-6">
      <PageHeader title="タスク" description="貴店に関するタスクの進捗を確認できます。" />

      {tasks.length === 0 ? (
        <EmptyState description="現在、タスクはありません。" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>タスク</TH>
                  <TH>期限</TH>
                  <TH>優先度</TH>
                  <TH>ステータス</TH>
                </TR>
              </THead>
              <TBody>
                {tasks.map((t) => (
                  <TR key={t.id}>
                    <TD className="font-medium text-navy-800">{t.title}</TD>
                    <TD className={cn(isOverdue(t.dueDate) && t.status !== "done" && "text-danger")}>
                      {formatDate(t.dueDate)}
                    </TD>
                    <TD><PriorityBadge value={t.priority} /></TD>
                    <TD><TaskStatusBadge value={t.status} /></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
