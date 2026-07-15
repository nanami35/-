import { describe, it, expect } from "vitest";
import { search, tokenize } from "@/lib/search";
import { users } from "@/lib/seed/orgs-users";
import type { SafeUser } from "@/lib/types";

const toSafe = (u: (typeof users)[number]): SafeUser => {
  const { password: _pw, ...safe } = u;
  return safe;
};
const admin = toSafe(users[0]!);
const viewer = toSafe(users.find((u) => u.role === "viewer")!);

describe("検索トークナイズ", () => {
  it("空白・句読点で分割する", () => {
    expect(tokenize("FC 本部、構築")).toEqual(["fc", "本部", "構築"]);
  });
});

describe("横断検索", () => {
  it("ベンチャー・リンクを検索できる", () => {
    const results = search(admin, "ベンチャーリンク");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.doc.title).toContain("ベンチャー");
  });

  it("FCで複数種別がヒットする", () => {
    const results = search(admin, "FC");
    const types = new Set(results.map((r) => r.doc.entityType));
    expect(types.size).toBeGreaterThan(1);
  });

  it("エンティティ種別で絞り込める", () => {
    const results = search(admin, "FC", { entityTypes: ["company"] });
    expect(results.every((r) => r.doc.entityType === "company")).toBe(true);
  });

  it("権限のない情報は検索結果に含まれない", () => {
    // プロジェクトはproject_members限定 → viewerには出ない
    const results = search(viewer, "カフェ", { entityTypes: ["project"] });
    expect(results.length).toBe(0);
  });
});
