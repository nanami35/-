"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, LineChart, FileText, ListChecks, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "ダッシュボード", href: "/portal", icon: LayoutDashboard },
  { label: "売上・KPI", href: "/portal/kpi", icon: LineChart },
  { label: "レポート", href: "/portal/reports", icon: FileText },
  { label: "タスク", href: "/portal/tasks", icon: ListChecks },
  { label: "資料", href: "/portal/uploads", icon: Upload },
];

interface PortalShellProps {
  user: { name: string; title?: string; avatarColor?: string };
  clientName: string;
  children: React.ReactNode;
}

export function PortalShell({ user, clientName, children }: PortalShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-navy-800 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-400 font-bold text-navy-900">
              M
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">クライアントポータル</p>
              <p className="text-[10px] text-navy-300">{clientName}</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* ユーザーメニュー */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-navy-700"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: user.avatarColor ?? "#0F766E" }}
              >
                {user.name.charAt(0)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight">{user.name}</span>
                <span className="block text-[11px] leading-tight text-navy-300">{user.title}</span>
              </span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-border bg-white py-1 text-navy-800 shadow-lg">
                  <form action="/api/logout" method="post">
                    <button type="submit" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> ログアウト
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ナビ */}
        <nav className="mx-auto max-w-6xl overflow-x-auto px-2 sm:px-6">
          <ul className="flex gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "border-gold-400 text-white"
                        : "border-transparent text-navy-300 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">{children}</main>
    </div>
  );
}
