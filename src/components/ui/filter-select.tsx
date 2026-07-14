"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  param: string;
  options: Option[];
  allLabel?: string;
}

/** URL クエリを更新する絞り込みセレクト（サーバー側でフィルタする前提） */
export function FilterSelect({ param, options, allLabel = "すべて" }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? "";

  function onChange(value: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) params.set(param, value);
    else params.delete(param);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-input bg-white px-3 text-sm text-navy-800 outline-none focus:border-navy-400 focus:ring-2 focus:ring-ring/40"
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
