import { cn } from "@/lib/cn";
import { Inbox } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-navy">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title = "データがありません",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-100 bg-white py-14 text-center">
      <Inbox className="h-8 w-8 text-navy-100" />
      <p className="mt-3 text-sm font-medium text-navy">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className={cn("py-2", className)}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-sm text-ink">{children}</div>
    </div>
  );
}

export function BulletList({ items }: { items?: (string | undefined)[] }) {
  const clean = (items ?? []).filter((x): x is string => !!x);
  if (clean.length === 0) return <span className="text-sm text-muted">—</span>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
      {clean.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}
