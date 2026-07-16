"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { NavIcon } from "@/components/layout/nav-icon";
import type { AppNotification, NotificationSeverity } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const dotColor: Record<NotificationSeverity, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  info: "bg-blue-500",
  success: "bg-success",
};

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const [open, setOpen] = React.useState(false);
  const actionable = notifications.filter(
    (n) => n.severity === "danger" || n.severity === "warning"
  ).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-navy-700 hover:bg-navy-50"
        aria-label="通知"
      >
        <Bell className="h-5 w-5" />
        {actionable > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {actionable > 9 ? "9+" : actionable}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-sm font-semibold text-navy-800">通知</span>
              <span className="text-xs text-muted-foreground">{notifications.length}件</span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  対応が必要な通知はありません。
                </p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 border-b border-border/60 px-4 py-3 hover:bg-navy-50"
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotColor[n.severity])} />
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                      <NavIcon name={n.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-navy-800">{n.title}</span>
                      <span className="block text-xs text-muted-foreground">{n.description}</span>
                    </span>
                  </Link>
                ))
              )}
            </div>

            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-gold-600 hover:bg-navy-50"
            >
              すべての通知を見る
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
