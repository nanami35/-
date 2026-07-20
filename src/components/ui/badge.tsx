import { cn } from "@/lib/cn";

type Tone = "gray" | "gold" | "green" | "red" | "blue" | "navy";

const TONE: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  gold: "bg-gold/10 text-gold-dark ring-gold/30",
  green: "bg-green-50 text-success ring-green-200",
  red: "bg-red-50 text-danger ring-red-200",
  blue: "bg-sky-50 text-info ring-sky-200",
  navy: "bg-navy-50 text-navy ring-navy-100",
};

export function Badge({
  children,
  tone = "gray",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
