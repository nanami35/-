#!/usr/bin/env node
// =====================================================================
// Supabase Auth 招待制アカウント プロビジョニング(Phase 1.1 タスク3)
// 権限別3アカウント(管理者 / 編集者 / 閲覧者)を Auth に作成し、
// user_profiles(ロール・所属)へ紐付ける。
//
// 実行前提:
//   - supabase/migrations と organizations の Seed が適用済み(orgs UUID を参照)。
//   - 環境変数:
//       NEXT_PUBLIC_SUPABASE_URL
//       SUPABASE_SECRET_KEY(新形式 sb_secret_…)または SUPABASE_SERVICE_ROLE_KEY(従来)
//   - 任意: DEMO_PASSWORD(既定 "Abengers#2026")
//
// 使い方: node scripts/provision-auth-users.mjs
// ※ secret キーは admin 権限。サーバー/CI でのみ実行し、公開しないこと。
// =====================================================================
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
// DEMO_PASSWORD 未指定なら、推測不能なランダム値を生成(公開リポジトリに直書きしない)。
const password =
  process.env.DEMO_PASSWORD || "Ab" + crypto.randomBytes(12).toString("base64url") + "#9";

if (!url || !secret) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SECRET_KEY(または SUPABASE_SERVICE_ROLE_KEY)が必要です。",
  );
  process.exit(1);
}

const ORG_ABENGERS = "11111111-1111-1111-1111-111111110002";
const ORG_KOENI = "11111111-1111-1111-1111-111111110003";

const ACCOUNTS = [
  { email: "admin@abengers.jp", name: "管理者 太郎", role: "super_admin", org: ORG_ABENGERS, isExecutive: true, isManager: true },
  { email: "editor@abengers.jp", name: "編集者 花子", role: "editor", org: ORG_ABENGERS, isExecutive: false, isManager: false },
  { email: "viewer@abengers.jp", name: "閲覧者 次郎", role: "viewer", org: ORG_ABENGERS, isExecutive: false, isManager: false },
];

const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUserByEmail(email) {
  // ページングして既存ユーザーを検索(冪等化のため)
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  const results = [];
  for (const a of ACCOUNTS) {
    let user = await findUserByEmail(a.email);
    if (user) {
      // 冪等化: 既存ユーザーはパスワードを既知の値へ更新(印字する資格情報を常に有効化)
      const { error } = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
      if (error) throw new Error(`updateUser 失敗(${a.email}): ${error.message}`);
      console.log(`= 既存(更新): ${a.email}(${user.id})`);
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: a.email,
        password,
        email_confirm: true,
        user_metadata: { name: a.name },
      });
      if (error) throw new Error(`createUser 失敗(${a.email}): ${error.message}`);
      user = data.user;
      console.log(`+ 作成: ${a.email}(${user.id})`);
    }

    // user_profiles へ紐付け(service/secret キーは RLS を回避)
    const { error: upErr } = await admin.from("user_profiles").upsert(
      {
        id: user.id,
        email: a.email,
        name: a.name,
        organization_id: a.org,
        role: a.role,
        is_executive: a.isExecutive,
        is_manager: a.isManager,
      },
      { onConflict: "id" },
    );
    if (upErr) throw new Error(`user_profiles upsert 失敗(${a.email}): ${upErr.message}`);
    results.push({ email: a.email, role: a.role, password });
  }

  // セキュリティ: パスワードはログへ出力しない(公開リポジトリの Actions ログ対策)。
  // 値は GitHub Secret 経由で渡し、共有はチャット等の安全な経路で行うこと。
  console.log("\n=== プロビジョニング完了(パスワードは非表示)===");
  for (const r of results) console.log(`  ${r.role.padEnd(12)} ${r.email}  / (password set)`);
  console.log(
    process.env.DEMO_PASSWORD
      ? "  パスワードは DEMO_PASSWORD(Secret 推奨)で設定されました。"
      : "  ⚠ DEMO_PASSWORD 未指定のためランダム生成しました。ダッシュボード等で確認/再設定してください。",
  );
}

main().catch((e) => {
  console.error("プロビジョニング失敗:", e.message);
  process.exit(1);
});
