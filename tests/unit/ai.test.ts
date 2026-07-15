import { describe, it, expect, beforeEach } from "vitest";
import { resolveProvider, isMockMode } from "@/lib/ai/provider";

describe("AIプロバイダー切替(要件13/19)", () => {
  beforeEach(() => {
    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  it("未設定時はmock", () => {
    expect(resolveProvider()).toBe("mock");
    expect(isMockMode()).toBe(true);
  });

  it("APIキー未設定のopenai指定はmockへフォールバック", () => {
    process.env.AI_PROVIDER = "openai";
    expect(resolveProvider()).toBe("mock");
  });

  it("APIキーありなら指定プロバイダーを使う", () => {
    process.env.AI_PROVIDER = "anthropic";
    process.env.ANTHROPIC_API_KEY = "sk-test";
    expect(resolveProvider()).toBe("anthropic");
    expect(isMockMode()).toBe(false);
  });

  it("不正な値はmock", () => {
    process.env.AI_PROVIDER = "unknown";
    expect(resolveProvider()).toBe("mock");
  });
});
