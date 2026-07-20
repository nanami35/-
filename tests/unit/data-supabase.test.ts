import { describe, it, expect, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

// フェイクの Supabase クライアントで、SupabaseProvider のクエリ構築と
// 行→ドメイン型マッピングを検証する(実 Supabase 接続なしで adapter の正しさを担保)。

const calls: { table: string; filters: Record<string, unknown> } = { table: "", filters: {} };
let rowsByTable: Record<string, unknown[]> = {};

function makeBuilder(table: string) {
  calls.table = table;
  const rows = rowsByTable[table] ?? [];
  const builder: Record<string, unknown> = {
    select: () => builder,
    is: (col: string, val: unknown) => {
      calls.filters[col] = val;
      return builder;
    },
    eq: (col: string, val: unknown) => {
      calls.filters[col] = val;
      return builder;
    },
    order: () => Promise.resolve({ data: rows, error: null }),
    maybeSingle: () => Promise.resolve({ data: rows[0] ?? null, error: null }),
  };
  return builder;
}

const fakeClient = { from: (table: string) => makeBuilder(table) } as unknown as SupabaseClient;

import { SupabaseProvider } from "@/lib/data/supabase";
import type { SafeUser } from "@/lib/types";

const user = { id: "u1", role: "member", organizationId: "o1" } as SafeUser;

beforeEach(() => {
  calls.table = "";
  calls.filters = {};
  rowsByTable = {};
});

describe("SupabaseProvider(モッククライアント)", () => {
  it("listCompanies は companies テーブルを deleted_at is null で問い合わせ、行をドメイン型へ写像する", async () => {
    rowsByTable.companies = [
      {
        id: "c1",
        organization_id: "o1",
        name: "船井総合研究所",
        name_kana: "フナイ",
        category: "consulting",
        industry: "経営コンサル",
        tags: ["ベンチマーク"],
        business_model: { valueProposition: "即時業績向上" },
        analysis: { strengths: ["業種特化"] },
        application: { priority: "medium" },
        status: "published",
        visibility: "all_staff",
        confidence_level: "C",
        certainty_level: "needs_check",
        created_at: "2026-01-01",
        updated_at: "2026-02-01",
      },
    ];
    const provider = new SupabaseProvider(fakeClient);
    const list = await provider.listCompanies(user);

    expect(calls.table).toBe("companies");
    expect(calls.filters).toHaveProperty("deleted_at", null);
    expect(list).toHaveLength(1);
    const c = list[0]!;
    expect(c.name).toBe("船井総合研究所");
    expect(c.nameKana).toBe("フナイ");
    expect(c.category).toBe("consulting");
    expect(c.businessModel.valueProposition).toBe("即時業績向上");
    expect(c.analysis.strengths).toEqual(["業種特化"]);
    expect(c.confidenceLevel).toBe("C");
    expect(c.logoText).toBe("船井"); // 先頭2文字
  });

  it("getCompany は id で単一行を取得し、無ければ null", async () => {
    rowsByTable.companies = [];
    const provider = new SupabaseProvider(fakeClient);
    const c = await provider.getCompany(user, "missing");
    expect(calls.filters).toHaveProperty("id", "missing");
    expect(c).toBeNull();
  });

  it("listKnowledge は data(jsonb)を展開してドメイン型へ写像する", async () => {
    rowsByTable.knowledge_articles = [
      {
        id: "k1",
        organization_id: "o1",
        title: "FC本部構築のセンターピン",
        category: "FC本部構築",
        tags: ["FC"],
        data: { summary: "投資回収可能性が肝", importance: "high" },
        status: "published",
        visibility: "all_staff",
        confidence_level: "A",
        certainty_level: "confirmed",
      },
    ];
    const provider = new SupabaseProvider(fakeClient);
    const list = await provider.listKnowledge(user);
    expect(calls.table).toBe("knowledge_articles");
    expect(list[0]!.title).toBe("FC本部構築のセンターピン");
    expect(list[0]!.summary).toBe("投資回収可能性が肝");
    expect(list[0]!.importance).toBe("high");
  });

  it("kind は 'supabase'", () => {
    expect(new SupabaseProvider(fakeClient).kind).toBe("supabase");
  });
});
