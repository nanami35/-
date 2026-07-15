import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { generateDraft } from "@/lib/ai/service";
import { getAiTask } from "@/lib/ai/tasks";
import type { AiTaskType } from "@/lib/ai/types";

export async function POST(request: Request) {
  // 認証必須（マーケ担当者・管理者のみ）
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (user.role === "client") {
    return NextResponse.json({ error: "権限がありません。" }, { status: 403 });
  }

  let body: { task?: string; storeId?: string; month?: string; freeInput?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  if (!body.task || !getAiTask(body.task)) {
    return NextResponse.json({ error: "タスクが不正です。" }, { status: 400 });
  }

  try {
    const result = await generateDraft({
      task: body.task as AiTaskType,
      storeId: body.storeId,
      month: body.month,
      freeInput: body.freeInput?.slice(0, 8000),
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
