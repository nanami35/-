import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getNotifications, type NotificationSeverity } from "@/lib/notifications";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NavIcon } from "@/components/layout/nav-icon";

const toneMap: Record<NotificationSeverity, BadgeTone> = {
  danger: "danger",
  warning: "warning",
  info: "info",
  success: "success",
};
const labelMap: Record<NotificationSeverity, string> = {
  danger: "要対応",
  warning: "注意",
  info: "お知らせ",
  success: "完了",
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotifications(user);

  return (
    <div className="space-y-6">
      <PageHeader
        title="通知"
        description="対応が必要な事項をまとめて確認できます。"
      >
        <Badge tone="navy">{notifications.length}件</Badge>
      </PageHeader>

      {notifications.length === 0 ? (
        <EmptyState
          title="通知はありません"
          description="現在、対応が必要な事項はありません。"
        />
      ) : (
        <Card className="divide-y divide-border">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className="flex items-start gap-3 p-4 transition-colors hover:bg-navy-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                <NavIcon name={n.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-navy-800">{n.title}</p>
                  <Badge tone={toneMap[n.severity]}>{labelMap[n.severity]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{n.description}</p>
              </div>
              <span className="mt-1 text-xs font-medium text-gold-600">確認 →</span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
