/**
 * AI プロバイダ抽象。
 * 環境変数で実装を切り替える（拡張可能な構造）。
 *   - ANTHROPIC_API_KEY あり  → Claude（Anthropic）
 *   - AI_PROVIDER=mock / キー無し → モック（デモ・オフラインでも動作）
 *   - OpenAI 等は openai-provider を追加して getAiProvider に組み込む
 */
import { mockGenerate } from "@/lib/ai/mock-provider";

export interface AiProvider {
  name: string;
  model: string;
  generate(system: string, user: string): Promise<string>;
}

/** 既定モデル。ANTHROPIC 使用時に AI_MODEL で上書き可能。 */
const DEFAULT_MODEL = process.env.AI_MODEL ?? "claude-opus-4-8";

function anthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY) && process.env.AI_PROVIDER !== "mock";
}

const mockProvider: AiProvider = {
  name: "mock",
  model: "mock",
  generate: async (system, user) => mockGenerate(system, user),
};

/** 現在の AI プロバイダを取得する（サーバー専用） */
export function getAiProvider(): AiProvider {
  if (anthropicConfigured()) {
    return {
      name: "anthropic",
      model: DEFAULT_MODEL,
      generate: async (system, user) => {
        // 動的 import: キー未設定のデモ環境で SDK を読み込まない
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await client.messages.create({
          model: DEFAULT_MODEL,
          max_tokens: 4000,
          system,
          messages: [{ role: "user", content: user }],
        });
        return response.content
          .filter((b): b is { type: "text"; text: string; citations: null } =>
            b.type === "text"
          )
          .map((b) => b.text)
          .join("\n")
          .trim();
      },
    };
  }
  return mockProvider;
}

/** AI が有効か（UI 表示用。モックでも true = 常に利用可能） */
export function isAiEnabled(): boolean {
  return true;
}

/** 実際に外部 API に接続しているか（モックかどうかの表示用） */
export function isAiLive(): boolean {
  return anthropicConfigured();
}
