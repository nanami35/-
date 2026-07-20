import { NextResponse } from "next/server";
import { classifyKey } from "@/lib/supabase";

// 診断用ヘルスチェック(秘密情報は返さない)。
// 本番の実効モード(seed / supabase)と主要 env の設定有無のみを返す。
export const dynamic = "force-dynamic";

export function GET() {
  const dataSource = process.env.DATA_SOURCE ?? "seed";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  return NextResponse.json({
    mode: dataSource === "supabase" ? "supabase" : "seed",
    dataSource,
    supabaseUrlSet: Boolean(url),
    publishableKeySet: Boolean(publishable),
    publishableKeyKind: publishable ? classifyKey(publishable) : "unset",
    secretKeySet: Boolean(secret),
    nodeEnv: process.env.NODE_ENV,
  });
}
