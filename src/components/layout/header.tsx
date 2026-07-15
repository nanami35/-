"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Bell, Search, LogOut } from "lucide-react";
import type { SafeUser } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/rbac";
import { logoutAction } from "@/app/(app)/actions";

export function Header({
  user,
  orgName,
  unreadCount,
}: {
  user: SafeUser;
  orgName: string;
  unreadCount: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-navy-100/60 bg-white/90 px-4 backdrop-blur">
      <form
        className="relative hidden max-w-md flex-1 md:block"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(q)}`);
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="企業・ノウハウ・事例・人物を横断検索…"
          className="h-9 w-full rounded-lg border border-navy-100 bg-canvas pl-9 pr-3 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-navy-50 hover:text-navy"
          aria-label="通知"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 rounded-lg px-1.5 py-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: user.avatarColor ?? "#1A2B4A" }}
          >
            {user.name.slice(0, 1)}
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-xs font-medium text-navy">{user.name}</div>
            <div className="text-[10px] text-muted">
              {orgName}・{ROLE_LABELS[user.role]}
            </div>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-danger"
            aria-label="ログアウト"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
