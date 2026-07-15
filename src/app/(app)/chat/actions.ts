"use server";

import { getCurrentUser } from "@/lib/auth";
import { ask } from "@/lib/ai/rag";
import { audit } from "@/lib/store";
import type { AiAnswer } from "@/lib/types";

export async function askAction(question: string): Promise<AiAnswer> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      answer: "セッションが切れています。再度ログインしてください。",
      citations: [],
      hasEnoughInfo: false,
      isMock: true,
    };
  }
  audit(user.organizationId, user.id, "ai.ask", undefined, undefined, question.slice(0, 120));
  return ask(user, question);
}
