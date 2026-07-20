import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { q } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

export default async function MeetingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const meetings = q.meetings(user);

  return (
    <div>
      <PageHeader title="会議記録・意思決定管理" description="決定事項・却下案・前提を残し、意思決定の履歴を追跡可能にします。" />
      {meetings.length === 0 ? (
        <EmptyState title="会議記録がありません" />
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <Link key={m.id} href={`/meetings/${m.id}`}>
              <Card className="transition-shadow hover:shadow-panel">
                <CardBody className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {m.heldAt?.slice(0, 10)}
                    </div>
                    <div className="mt-1 font-semibold text-navy">{m.title}</div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted">{m.aiSummary}</p>
                  </div>
                  <Badge tone="navy">{m.decisions?.length ?? 0} 決定</Badge>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
