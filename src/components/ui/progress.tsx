import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  tone?: "navy" | "gold" | "success" | "warning" | "danger";
}

const toneClasses: Record<NonNullable<ProgressProps["tone"]>, string> = {
  navy: "bg-navy-600",
  gold: "bg-gold-400",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function Progress({ value, className, tone = "navy" }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-navy-100", className)}>
      <div
        className={cn("h-full rounded-full transition-all", toneClasses[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
