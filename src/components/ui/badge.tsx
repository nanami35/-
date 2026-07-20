import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "default" | "navy" | "gold" | "success" | "warning" | "danger" | "muted" | "info";

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-navy-100 text-navy-700",
  navy: "bg-navy-700 text-white",
  gold: "bg-gold-100 text-gold-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  danger: "bg-red-100 text-red-700",
  muted: "bg-muted text-muted-foreground",
  info: "bg-blue-100 text-blue-700",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
