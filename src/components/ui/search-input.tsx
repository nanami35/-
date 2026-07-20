"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SearchInputProps {
  param?: string;
  placeholder?: string;
}

/** URL クエリ(?q=)を更新する検索ボックス（サーバー側でフィルタする前提） */
export function SearchInput({ param = "q", placeholder = "検索..." }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get(param) ?? "");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (value) params.set(param, value);
      else params.delete(param);
      router.replace(`${pathname}?${params.toString()}`);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-white pl-9 pr-3 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-ring/40 sm:w-64"
      />
    </div>
  );
}
