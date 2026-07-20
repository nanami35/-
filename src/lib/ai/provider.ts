import "server-only";

// =====================================================================
// AIプロバイダー抽象化(要件13・15・19)
// 環境変数 AI_PROVIDER で mock / openai / anthropic / gemini を切替。
// APIキー未設定なら自動的に mock へフォールバック(AI以外は常時動作)。
// =====================================================================

export type AiProvider = "mock" | "openai" | "anthropic" | "gemini";

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

export function resolveProvider(): AiProvider {
  const p = (process.env.AI_PROVIDER ?? "mock").toLowerCase() as AiProvider;
  if (p === "openai" && !process.env.OPENAI_API_KEY) return "mock";
  if (p === "anthropic" && !process.env.ANTHROPIC_API_KEY) return "mock";
  if (p === "gemini" && !process.env.GEMINI_API_KEY) return "mock";
  if (!["mock", "openai", "anthropic", "gemini"].includes(p)) return "mock";
  return p;
}

export function isMockMode(): boolean {
  return resolveProvider() === "mock";
}

/**
 * LLM補完。MVPでは実API呼び出しはプレースホルダとし、
 * 実運用時に各プロバイダーSDKへ差し替える(構造のみ提供)。
 */
export async function complete(messages: ChatTurn[]): Promise<{ text: string; isMock: boolean }> {
  const provider = resolveProvider();
  if (provider === "mock") {
    return { text: "", isMock: true };
  }
  // 実APIモード。ネットワーク/キー障害時は mock へ安全にフォールバック。
  try {
    const text = await callRealProvider(provider, messages);
    return { text, isMock: false };
  } catch (err) {
    console.error("[ai] real provider failed, falling back to mock:", err);
    return { text: "", isMock: true };
  }
}

async function callRealProvider(provider: AiProvider, messages: ChatTurn[]): Promise<string> {
  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
        max_tokens: 1200,
        system: messages.find((m) => m.role === "system")?.content,
        messages: messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const json = (await res.json()) as { content?: { text?: string }[] };
    return json.content?.map((c) => c.text ?? "").join("") ?? "";
  }

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages,
      }),
    });
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? "";
  }

  if (provider === "gemini") {
    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        }),
      },
    );
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  }

  return "";
}
