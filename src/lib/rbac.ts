import type { BaseEntity, Role, SafeUser, Visibility } from "@/lib/types";
import { SEED_GROUP_ORG, ABENGERS_ORG, KOENI_ORG } from "@/lib/seed/helpers";

// =====================================================================
// 権限・可視性判定(要件 10)
// フロントで隠すだけでなく、データ取得層(store)でこの関数を必ず通す。
// 本番では Supabase RLS が同等のロジックをDBレベルで担う。
// =====================================================================

const ROLE_RANK: Record<Role, number> = {
  super_admin: 100,
  group_admin: 90,
  company_admin: 80,
  approver: 60,
  editor: 50,
  member: 30,
  viewer: 20,
  guest: 10,
};

export function hasRoleAtLeast(user: SafeUser, role: Role): boolean {
  return ROLE_RANK[user.role] >= ROLE_RANK[role];
}

export function isAdmin(user: SafeUser): boolean {
  return hasRoleAtLeast(user, "company_admin");
}

export function canApprove(user: SafeUser): boolean {
  return hasRoleAtLeast(user, "approver");
}

export function canEdit(user: SafeUser): boolean {
  return hasRoleAtLeast(user, "editor");
}

/** ユーザーが所属グループ(SEED)の企業か */
function sameGroup(user: SafeUser): boolean {
  return [ABENGERS_ORG, KOENI_ORG, SEED_GROUP_ORG].includes(user.organizationId);
}

/**
 * 1件のエンティティをユーザーが閲覧できるか(要件10)。
 * RLS相当。可視性 + ステータス + 論理削除を判定する。
 */
export function canView(user: SafeUser, e: BaseEntity): boolean {
  if (e.deletedAt) return isAdmin(user);

  // 下書き/AI整理中は作成者と承認者以上のみ
  const isDraftLike = e.status === "draft" || e.status === "ai_processing";
  if (isDraftLike && e.createdBy !== user.id && !canApprove(user)) return false;

  // 非公開/アーカイブは管理者・作成者のみ
  if ((e.status === "unpublished" || e.status === "archived") && e.createdBy !== user.id && !isAdmin(user)) {
    return false;
  }

  return matchesVisibility(user, e.visibility, e.organizationId, e.createdBy);
}

function matchesVisibility(
  user: SafeUser,
  visibility: Visibility,
  orgId: string,
  createdBy: string,
): boolean {
  if (isAdmin(user)) return true; // 企業管理者以上は自組織範囲を横断的に閲覧可

  switch (visibility) {
    case "all_staff":
      return true;
    case "seed_group":
      return sameGroup(user);
    case "abengers_only":
      return user.organizationId === ABENGERS_ORG;
    case "koeni_only":
      return user.organizationId === KOENI_ORG;
    case "own_company":
      return user.organizationId === orgId;
    case "managers":
      return !!user.isManager;
    case "executives":
      return !!user.isExecutive;
    case "project_members":
      // MVP: 同組織かつ編集者以上または管理職のみ(本番はproject_membersテーブルで判定)。
      // 一般ユーザー・閲覧専用は、メンバー限定情報を閲覧できない。
      return (
        user.organizationId === orgId &&
        (user.isManager === true || hasRoleAtLeast(user, "editor"))
      );
    case "specified_users":
      return createdBy === user.id;
    case "admins":
      return isAdmin(user);
    case "private":
      return createdBy === user.id;
    default:
      return false;
  }
}

/** 配列を可視性でフィルタ */
export function filterViewable<T extends BaseEntity>(user: SafeUser, items: T[]): T[] {
  return items.filter((e) => canView(user, e));
}

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  all_staff: "全社員",
  seed_group: "SEEDグループ共通",
  abengers_only: "ABENGERSのみ",
  koeni_only: "コエニのみ",
  own_company: "所属企業のみ",
  managers: "管理職のみ",
  executives: "役員のみ",
  project_members: "プロジェクトメンバーのみ",
  specified_users: "指定ユーザーのみ",
  admins: "管理者のみ",
  private: "自分のみ",
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "スーパー管理者",
  group_admin: "グループ管理者",
  company_admin: "企業管理者",
  approver: "承認者",
  editor: "編集者",
  member: "一般ユーザー",
  viewer: "閲覧専用",
  guest: "外部ゲスト",
};
