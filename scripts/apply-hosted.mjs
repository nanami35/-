#!/usr/bin/env node
// =====================================================================
// ホスト型 Supabase へ マイグレーションを適用(Phase 1.1 手順1)
// Supabase Management API の SQL 実行エンドポイントを使うため、DB パスワードや
// 接続文字列は不要(登録済みの SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF のみ)。
//
// 環境変数:
//   SUPABASE_ACCESS_TOKEN … Supabase アクセストークン
//   SUPABASE_PROJECT_REF  … プロジェクト ref
//
// 冪等性: "already exists" 系のエラーは警告として継続(再実行可能)。
// =====================================================================
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;
if (!token || !ref) {
  console.error("SUPABASE_ACCESS_TOKEN と SUPABASE_PROJECT_REF が必要です。");
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "supabase/migrations/0001_init.sql",
  "supabase/migrations/0002_rls.sql",
  "supabase/migrations/0003_grants.sql",
];

const ENDPOINT = `https://api.supabase.com/v1/projects/${ref}/database/query`;

async function runSql(query, label) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    const tolerable = /already exists|does not exist|duplicate/i.test(text);
    if (tolerable) {
      console.warn(`⚠ ${label}: 既存のため一部スキップ (${res.status})`);
      return;
    }
    throw new Error(`${label} 失敗 (${res.status}): ${text.slice(0, 400)}`);
  }
  console.log(`✓ ${label} 適用`);
}

async function main() {
  for (const f of files) {
    const sql = readFileSync(join(root, f), "utf8");
    await runSql(sql, f);
  }
  console.log("✅ ホスト Supabase へのマイグレーション適用 完了");
}
main().catch((e) => {
  console.error("apply-hosted 失敗:", e.message);
  process.exit(1);
});
