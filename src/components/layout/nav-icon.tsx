import {
  LayoutDashboard, Building2, Store, ClipboardList, Gauge, Map, Swords,
  Scale, AlertTriangle, Target, LineChart, Rocket, Instagram, ListChecks,
  Users, FileText, BookOpen, LayoutTemplate, UserCog, Settings, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, Building2, Store, ClipboardList, Gauge, Map, Swords,
  Scale, AlertTriangle, Target, LineChart, Rocket, Instagram, ListChecks,
  Users, FileText, BookOpen, LayoutTemplate, UserCog, Settings,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
