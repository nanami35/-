import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "gold";
  className?: string;
}

const toneRing: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-navy-700 bg-navy-50",
  success: "text-green-700 bg-green-50",
  warning: "text-orange-700 bg-orange-50",
  danger: "text-red-700 bg-red-50",
  gold: "text-gold-700 bg-gold-50",
};

export function StatCard({ label, value, sub, icon, tone = "default", className }: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-navy-800">{value}</p>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
        {icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneRing[tone])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
