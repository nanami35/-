import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NOTIF_LABELS, NOTIF_TONE } from "@/lib/labels";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/(app)/actions";
import { Bell, CheckCheck } from "lucide-react";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const notifications = db.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHeader
        title="通知一覧"
        description="企業更新・承認依頼・確認期限・応用候補などをアプリ内通知でお知らせします。"
        actions={
          <form action={markAllNotificationsReadAction}>
            <Button size="sm" variant="secondary">
              <CheckCheck className="h-4 w-4" /> すべて既読
            </Button>
          </form>
        }
      />
      {notifications.length === 0 ? (
        <EmptyState title="通知はありません" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.read ? "opacity-70" : ""}>
              <CardBody className="flex items-start justify-between gap-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone={NOTIF_TONE[n.level]}>{NOTIF_LABELS[n.level]}</Badge>
                      {n.link ? (
                        <Link href={n.link} className="text-sm font-medium text-navy hover:underline">
                          {n.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-navy">{n.title}</span>
                      )}
                      {!n.read && <span className="h-2 w-2 rounded-full bg-danger" />}
                    </div>
                    {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}
                    <p className="mt-0.5 text-[11px] text-muted">{n.createdAt.slice(0, 10)}</p>
                  </div>
                </div>
                {!n.read && (
                  <form action={markNotificationReadAction.bind(null, n.id)}>
                    <Button size="sm" variant="ghost">
                      既読
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
