import { describe, it, expect, beforeEach } from "vitest";
import { classifyKey, createUserClient, createServiceClient } from "@/lib/supabase";

const PUBLISHABLE = "sb_publishable_ABCDEF123456";
const SECRET = "sb_secret_ABCDEF123456";
const LEGACY_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig";

function clearSupabaseEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
}

describe("classifyKey(新形式キーの判定)", () => {
  it("sb_publishable_ を publishable と判定", () => {
    expect(classifyKey(PUBLISHABLE)).toBe("publishable");
  });
  it("sb_secret_ を secret と判定", () => {
    expect(classifyKey(SECRET)).toBe("secret");
  });
  it("従来の JWT を legacy-jwt と判定", () => {
    expect(classifyKey(LEGACY_JWT)).toBe("legacy-jwt");
  });
  it("不明な文字列は unknown", () => {
    expect(classifyKey("random")).toBe("unknown");
  });
});

describe("createUserClient(公開クライアント)", () => {
  beforeEach(clearSupabaseEnv);

  it("新形式 publishable キーで生成できる", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = PUBLISHABLE;
    expect(() => createUserClient()).not.toThrow();
  });

  it("従来の anon JWT でも後方互換で生成できる", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = LEGACY_JWT;
    expect(() => createUserClient()).not.toThrow();
  });

  it("公開スロットに secret キーがあると露出防止のため例外", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = SECRET;
    expect(() => createUserClient()).toThrow(/secret/i);
  });

  it("URL 未設定なら例外", () => {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = PUBLISHABLE;
    expect(() => createUserClient()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});

describe("createServiceClient(サーバー専用)", () => {
  beforeEach(clearSupabaseEnv);

  it("新形式 secret キーで生成できる", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.SUPABASE_SECRET_KEY = SECRET;
    expect(() => createServiceClient()).not.toThrow();
  });

  it("従来の service_role JWT でも後方互換で生成できる", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = LEGACY_JWT;
    expect(() => createServiceClient()).not.toThrow();
  });

  it("サーバー用スロットに publishable キーがあると例外", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.SUPABASE_SECRET_KEY = PUBLISHABLE;
    expect(() => createServiceClient()).toThrow(/publishable/i);
  });
});
