import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { syncProvider } from "@/lib/integrations/ingest";
import { getIntegrationDef } from "@/lib/integrations/definitions";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (user.role === "client") {
    return NextResponse.json({ error: "権限がありません。" }, { status: 403 });
  }

  let body: { provider?: string; storeId?: string; month?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  if (!body.provider || !getIntegrationDef(body.provider)) {
    return NextResponse.json({ error: "連携プロバイダが不正です。" }, { status: 400 });
  }
  if (!body.storeId) {
    return NextResponse.json({ error: "店舗が指定されていません。" }, { status: 400 });
  }

  try {
    const result = await syncProvider(body.provider, body.storeId, body.month);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "同期に失敗しました。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
