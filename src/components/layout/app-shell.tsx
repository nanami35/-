"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AppShellProps {
  user: { name: string; role: Role; title?: string; avatarColor?: string };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* デスクトップ固定サイドバー */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">
        <Sidebar role={user.role} />
      </aside>

      {/* モバイルドロワー */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-60">
            <Sidebar role={user.role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        {/* ヘッダー */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          {/* ユーザーメニュー */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-navy-50"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: user.avatarColor ?? "#1A2B4A" }}
              >
                {user.name.charAt(0)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-navy-800">{user.name}</span>
                <span className="block text-[11px] leading-tight text-muted-foreground">
                  {ROLE_LABELS[user.role]}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-border bg-white py-1 shadow-lg">
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-sm font-medium text-navy-800">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.title ?? ROLE_LABELS[user.role]}</p>
                  </div>
                  <Link href="/settings" className="block px-3 py-2 text-sm text-navy-700 hover:bg-navy-50" onClick={() => setMenuOpen(false)}>
                    設定
                  </Link>
                  <form action="/api/logout" method="post">
                    <button type="submit" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> ログアウト
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </header>

        <main className={cn("mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6")}>{children}</main>
      </div>
    </div>
  );
}
