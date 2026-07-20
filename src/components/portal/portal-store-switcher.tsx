"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** 複数店舗を持つクライアント向けの店舗切替（?store=） */
export function PortalStoreSwitcher({
  stores,
  current,
}: {
  stores: { id: string; name: string }[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (stores.length <= 1) return null;

  function onChange(value: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("store", value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-input bg-white px-3 text-sm text-navy-800 outline-none focus:border-navy-400"
    >
      {stores.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}
