import * as React from "react";
import { cn } from "@/lib/utils";

export interface DataListItem {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}

interface DataListProps {
  items: DataListItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

/** ラベル/値のペアを整列表示する定義リスト */
export function DataList({ items, columns = 2, className }: DataListProps) {
  const colClass = columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-4", colClass, className)}>
      {items.map((item, i) => (
        <div key={i} className={cn("min-w-0", item.full && "sm:col-span-full")}>
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 break-words text-sm text-navy-800">
            {item.value === null || item.value === undefined || item.value === "" ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
