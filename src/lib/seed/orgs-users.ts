import type { Organization, User } from "@/lib/types";
import { ABENGERS_ORG, KOENI_ORG, SEED_GROUP_ORG } from "./helpers";

export const organizations: Organization[] = [
  { id: SEED_GROUP_ORG, name: "SEEDグループ", slug: "seed-group", kind: "group", createdAt: "2026-01-01T00:00:00Z" },
  { id: ABENGERS_ORG, name: "ABENGERS", slug: "abengers", kind: "company", parentId: SEED_GROUP_ORG, createdAt: "2026-01-01T00:00:00Z" },
  { id: KOENI_ORG, name: "コエニ", slug: "koeni", kind: "company", parentId: SEED_GROUP_ORG, createdAt: "2026-01-01T00:00:00Z" },
];

// デモ用ユーザー。パスワードは README に記載(本番は Supabase Auth)。
export const users: User[] = [
  {
    id: "user-hori",
    email: "admin@abengers.jp",
    password: "password",
    name: "堀 健一",
    organizationId: ABENGERS_ORG,
    role: "super_admin",
    title: "代表取締役",
    isExecutive: true,
    isManager: true,
    avatarColor: "#1A2B4A",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "user-approver",
    email: "approver@abengers.jp",
    password: "password",
    name: "承認 太郎",
    organizationId: ABENGERS_ORG,
    role: "approver",
    title: "事業責任者",
    isManager: true,
    avatarColor: "#25406B",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "user-editor",
    email: "editor@abengers.jp",
    password: "password",
    name: "編集 花子",
    organizationId: ABENGERS_ORG,
    role: "editor",
    title: "コンサルタント",
    avatarColor: "#1C7293",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "user-koeni",
    email: "marketer@koeni.jp",
    password: "password",
    name: "小枝 実",
    organizationId: KOENI_ORG,
    role: "editor",
    title: "マーケティング責任者",
    isManager: true,
    avatarColor: "#C9A227",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "user-viewer",
    email: "viewer@abengers.jp",
    password: "password",
    name: "閲覧 次郎",
    organizationId: ABENGERS_ORG,
    role: "viewer",
    title: "アシスタント",
    avatarColor: "#6B7280",
    createdAt: "2026-01-01T00:00:00Z",
  },
];
