"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  param?: string;
  items: TabItem[];
  defaultValue?: string;
}

/** URL クエリで切り替えるタブ（サーバーコンポーネントと併用可能） */
export function Tabs({ param = "tab", items, defaultValue }: TabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? defaultValue ?? items[0]?.value ?? "";

  function hrefFor(value: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set(param, value);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {items.map((item) => {
        const active = current === item.value;
        return (
          <Link
            key={item.value}
            href={hrefFor(item.value)}
            scroll={false}
            className={cn(
              "-mb-px border-b-2 px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-gold-400 text-navy-800"
                : "border-transparent text-muted-foreground hover:text-navy-700"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
