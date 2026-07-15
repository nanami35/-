import { describe, it, expect } from "vitest";
import { canView, filterViewable, hasRoleAtLeast, isAdmin } from "@/lib/rbac";
import type { BaseEntity, SafeUser } from "@/lib/types";
import { ABENGERS_ORG, KOENI_ORG } from "@/lib/seed/helpers";

function user(overrides: Partial<SafeUser>): SafeUser {
  return {
    id: "u1",
    email: "u1@x.jp",
    name: "テスト",
    organizationId: ABENGERS_ORG,
    role: "member",
    createdAt: "2026-01-01",
    ...overrides,
  };
}

function entity(overrides: Partial<BaseEntity>): BaseEntity {
  return {
    id: "e1",
    organizationId: ABENGERS_ORG,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    createdBy: "author",
    updatedBy: "author",
    status: "published",
    visibility: "all_staff",
    confidenceLevel: "B",
    certaintyLevel: "strong",
    ...overrides,
  };
}

describe("ロール階層", () => {
  it("承認者は編集者以上", () => {
    expect(hasRoleAtLeast(user({ role: "approver" }), "editor")).toBe(true);
  });
  it("閲覧専用は編集者未満", () => {
    expect(hasRoleAtLeast(user({ role: "viewer" }), "editor")).toBe(false);
  });
  it("企業管理者以上はisAdmin", () => {
    expect(isAdmin(user({ role: "company_admin" }))).toBe(true);
    expect(isAdmin(user({ role: "editor" }))).toBe(false);
  });
});

describe("可視性(RLS相当)", () => {
  it("全社員公開は誰でも閲覧可", () => {
    expect(canView(user({ role: "viewer" }), entity({ visibility: "all_staff" }))).toBe(true);
  });

  it("ABENGERSのみは他社ユーザーに非公開", () => {
    const koeniUser = user({ organizationId: KOENI_ORG, role: "editor" });
    expect(canView(koeniUser, entity({ visibility: "abengers_only" }))).toBe(false);
  });

  it("役員のみは非役員に非公開", () => {
    expect(canView(user({ isExecutive: false }), entity({ visibility: "executives" }))).toBe(false);
    expect(canView(user({ isExecutive: true }), entity({ visibility: "executives" }))).toBe(true);
  });

  it("プロジェクトメンバー限定は一般ユーザーに非公開・編集者に公開", () => {
    expect(canView(user({ role: "member" }), entity({ visibility: "project_members" }))).toBe(false);
    expect(canView(user({ role: "editor" }), entity({ visibility: "project_members" }))).toBe(true);
  });

  it("下書きは作成者と承認者のみ", () => {
    const draft = entity({ status: "draft", createdBy: "author" });
    expect(canView(user({ id: "other", role: "member" }), draft)).toBe(false);
    expect(canView(user({ id: "author", role: "member" }), draft)).toBe(true);
    expect(canView(user({ id: "other", role: "approver" }), draft)).toBe(true);
  });

  it("論理削除された情報は管理者のみ", () => {
    const deleted = entity({ deletedAt: "2026-06-01" });
    expect(canView(user({ role: "member" }), deleted)).toBe(false);
    expect(canView(user({ role: "company_admin" }), deleted)).toBe(true);
  });

  it("filterViewableは閲覧不可を除外する", () => {
    const items = [
      entity({ id: "a", visibility: "all_staff" }),
      entity({ id: "b", visibility: "executives" }),
    ];
    const result = filterViewable(user({ isExecutive: false }), items);
    expect(result.map((r) => r.id)).toEqual(["a"]);
  });
});
