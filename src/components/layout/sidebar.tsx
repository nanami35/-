"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavGroup, type Role } from "@/lib/constants";
import { NavIcon } from "@/components/layout/nav-icon";
import { cn } from "@/lib/utils";

const GROUP_ORDER: NavGroup[] = ["運用", "分析", "戦略・施策", "管理"];

export function Sidebar({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-full flex-col bg-navy-800 text-navy-100">
      {/* ロゴ */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-400 font-bold text-navy-900">
          M
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Marketing OS</p>
          <p className="text-[10px] text-navy-300">飲食店マーケティング</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {GROUP_ORDER.map((group) => {
          const groupItems = items.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                {group}
              </p>
              <ul className="space-y-0.5">
                {groupItems.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-navy-600 font-medium text-white"
                            : "text-navy-200 hover:bg-navy-700 hover:text-white"
                        )}
                      >
                        <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.phase > 1 && (
                          <span className="ml-auto rounded bg-navy-700 px-1.5 py-0.5 text-[9px] text-navy-300">
                            P{item.phase}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-navy-700 px-5 py-3">
        <p className="text-[10px] text-navy-400">© 2026 Marketing OS</p>
      </div>
    </div>
  );
}
