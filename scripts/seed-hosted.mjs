#!/usr/bin/env node
// =====================================================================
// ホスト型 Supabase への デモデータ投入(Phase 1.1 手順1)
// service(secret)キーで PostgREST 経由に upsert する(RLS を回避)。
// auth.users には触れない(アカウントは provision-auth-users.mjs が Auth 経由で作成)。
//
// 環境変数:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SECRET_KEY(新形式)または SUPABASE_SERVICE_ROLE_KEY(従来)
// =====================================================================
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SECRET_KEY/SERVICE_ROLE_KEY が必要です。");
  process.exit(1);
}
const db = createClient(url, secret, { auth: { persistSession: false } });

const ORG_SEED = "11111111-1111-1111-1111-111111110001";
const ORG_ABENGERS = "11111111-1111-1111-1111-111111110002";
const ORG_KOENI = "11111111-1111-1111-1111-111111110003";

const organizations = [
  { id: ORG_SEED, name: "SEEDグループ", slug: "seed-group", kind: "group", parent_id: null },
  { id: ORG_ABENGERS, name: "ABENGERS", slug: "abengers", kind: "company", parent_id: ORG_SEED },
  { id: ORG_KOENI, name: "コエニ", slug: "koeni", kind: "company", parent_id: ORG_SEED },
];

// 可視性の異なる企業(権限別3アカウントのRLSデモ用)
// created_by / updated_by は user_profiles への FK。アカウント作成前に投入するため
// null のままにする(列は nullable)。表示上の作成者は未設定となるが可視性判定には影響しない。
const companies = [
  mkCompany("33333333-0000-0000-0000-000000000001", "ABENGERS", "abengers", "共同経営型 事業創造", "all_staff", "A", "confirmed", { valueProposition: "構想・経営・実行・人材・マーケ・FC化・出資までを一体で担う共同経営型の事業創造" }),
  mkCompany("33333333-0000-0000-0000-000000000002", "ABENGERS極秘事業計画", "abengers", "未公開事業", "abengers_only", "A", "confirmed", { valueProposition: "(機密)新規事業の構想" }),
  mkCompany("33333333-0000-0000-0000-000000000003", "役員限定 出資案件", "coinvest_pe", "投資", "executives", "A", "strong", { valueProposition: "(役員限定)出資検討案件" }),
  mkCompany("33333333-0000-0000-0000-000000000004", "Cafe Verde FC本部構築(PJ限定)", "fc_support", "外食", "project_members", "A", "confirmed", { valueProposition: "地方カフェのFC本部構築(プロジェクト関係者限定)" }),
  mkCompany("33333333-0000-0000-0000-000000000006", "ベンチャー・リンク", "fc_support", "FC本部支援", "all_staff", "B", "strong", { valueProposition: "繁盛店をFC化し全国展開するプラットフォーム型FC支援(重要事例)" }),
];

const businessModels = [
  {
    id: "44444444-0000-0000-0000-000000000001",
    organization_id: ORG_ABENGERS,
    name: "ABENGERS型共同経営",
    definition: "構想・経営・実行・人材・マーケ・FC化・出資までを一体で担う共同経営型の事業創造モデル。",
    data: { revenueSources: ["受託・顧問", "成果報酬", "株式価値・EXIT"], scalability: "高" },
    tags: ["自社", "共同経営"],
    visibility: "all_staff",
    status: "published",
    confidence_level: "A",
    certainty_level: "confirmed",
  },
];

function mkCompany(id, name, category, industry, visibility, cl, cert, bm) {
  return {
    id,
    organization_id: ORG_ABENGERS,
    name,
    category,
    industry,
    visibility,
    status: "published",
    confidence_level: cl,
    certainty_level: cert,
    business_model: bm,
    analysis: {},
    application: {},
  };
}

async function upsert(table, rows) {
  const { error } = await db.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`${table} upsert 失敗: ${error.message}`);
  console.log(`✓ ${table}: ${rows.length} 件`);
}

async function main() {
  await upsert("organizations", organizations);
  await upsert("companies", companies);
  await upsert("business_models", businessModels);
  console.log("✅ ホスト Supabase へのデモデータ投入 完了");
}
main().catch((e) => {
  console.error("seed-hosted 失敗:", e.message);
  process.exit(1);
});
