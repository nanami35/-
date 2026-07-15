import { cn } from "@/lib/cn";

type Variant = "primary" | "gold" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-600 focus-visible:ring-navy",
  gold: "bg-gold text-white hover:bg-gold-dark focus-visible:ring-gold",
  secondary: "bg-white text-navy ring-1 ring-inset ring-navy-100 hover:bg-navy-50 focus-visible:ring-navy",
  ghost: "text-navy hover:bg-navy-50 focus-visible:ring-navy",
  danger: "bg-danger text-white hover:bg-red-700 focus-visible:ring-danger",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}
