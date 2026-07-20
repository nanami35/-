import type {
  AuditLog,
  Comment,
  Favorite,
  Notification,
  ReadingHistory,
} from "@/lib/types";
import { ABENGERS_ORG } from "./helpers";

export { organizations, users } from "./orgs-users";
export { companies } from "./companies";
export { businessModels } from "./business-models";
export { comparisonMatrices, comparisonTargetLabels } from "./comparison";
export {
  knowledgeArticles,
  caseStudies,
  projects,
  meetings,
  sources,
  people,
} from "./knowledge-cases-projects";

export const notifications: Notification[] = [
  {
    id: "ntf-1",
    organizationId: ABENGERS_ORG,
    userId: "user-hori",
    level: "important",
    title: "承認待ちの情報が1件あります",
    body: "「サーキュレーション」の企業情報が確認待ちです。",
    link: "/approvals",
    read: false,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "ntf-2",
    organizationId: ABENGERS_ORG,
    userId: "user-hori",
    level: "normal",
    title: "確認期限が近い情報があります",
    body: "「経営共創基盤」の情報が次回確認期限に近づいています。",
    link: "/companies/co-igpi",
    read: false,
    createdAt: "2026-07-02T09:00:00Z",
  },
  {
    id: "ntf-3",
    organizationId: ABENGERS_ORG,
    userId: "user-hori",
    level: "reference",
    title: "AIが自社への応用候補を抽出しました",
    body: "ベンチャー・リンク事例から、加盟店投資回収モデルの整備を提案。",
    link: "/knowledge/kn-fc-centerpin",
    read: true,
    createdAt: "2026-06-30T09:00:00Z",
  },
];

export const favorites: Favorite[] = [
  { id: "fav-1", userId: "user-hori", entityType: "company", entityId: "co-venturelink", createdAt: "2026-06-20T00:00:00Z" },
  { id: "fav-2", userId: "user-hori", entityType: "knowledge", entityId: "kn-fc-centerpin", createdAt: "2026-06-21T00:00:00Z" },
];

export const readingHistories: ReadingHistory[] = [
  { id: "rh-1", userId: "user-hori", entityType: "company", entityId: "co-abengers", viewedAt: "2026-07-01T08:00:00Z" },
];

export const comments: Comment[] = [
  {
    id: "cmt-1",
    organizationId: ABENGERS_ORG,
    entityType: "case",
    entityId: "case-vl-collapse",
    authorId: "user-approver",
    body: "この失敗要因はCafe VerdeのFC本部構築でも要注意。加盟開発の前提条件に反映しましょう。",
    resolved: false,
    createdAt: "2026-06-25T09:00:00Z",
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "aud-1",
    organizationId: ABENGERS_ORG,
    userId: "user-hori",
    action: "seed.initialized",
    detail: "初期シードデータを投入しました。",
    createdAt: "2026-06-01T00:00:00Z",
  },
];
