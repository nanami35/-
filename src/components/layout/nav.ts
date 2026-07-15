import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Building2,
  Users,
  Boxes,
  Table2,
  BookOpen,
  Trophy,
  FolderKanban,
  CalendarClock,
  Upload,
  CheckSquare,
  History,
  Rss,
  Bell,
  Star,
  Settings,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    title: "ホーム",
    items: [
      { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { href: "/search", label: "全体検索", icon: Search },
      { href: "/chat", label: "AIチャット", icon: Sparkles },
    ],
  },
  {
    title: "ナレッジ",
    items: [
      { href: "/companies", label: "企業図鑑", icon: Building2 },
      { href: "/people", label: "人物図鑑", icon: Users },
      { href: "/business-models", label: "ビジネスモデル図鑑", icon: Boxes },
      { href: "/compare", label: "比較マトリクス", icon: Table2 },
      { href: "/knowledge", label: "ノウハウライブラリ", icon: BookOpen },
      { href: "/cases", label: "成功・失敗事例", icon: Trophy },
    ],
  },
  {
    title: "社内",
    items: [
      { href: "/projects", label: "社内プロジェクト", icon: FolderKanban },
      { href: "/meetings", label: "会議記録・意思決定", icon: CalendarClock },
    ],
  },
  {
    title: "情報管理",
    items: [
      { href: "/ingest", label: "情報登録・取り込み", icon: Upload },
      { href: "/approvals", label: "承認待ち", icon: CheckSquare },
      { href: "/history", label: "更新履歴", icon: History },
      { href: "/sources", label: "情報ソース", icon: Rss },
    ],
  },
  {
    title: "個人",
    items: [
      { href: "/notifications", label: "通知", icon: Bell },
      { href: "/favorites", label: "お気に入り・履歴", icon: Star },
    ],
  },
  {
    title: "管理",
    items: [
      { href: "/admin", label: "管理コンソール", icon: Settings, adminOnly: true },
      { href: "/admin/audit", label: "監査ログ", icon: ShieldCheck, adminOnly: true },
    ],
  },
];
