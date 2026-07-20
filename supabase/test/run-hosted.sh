#!/usr/bin/env bash
# =====================================================================
# ホスト型 Supabase に対する マイグレーション→Seed→RLS実機テスト
# 本番 Supabase には auth スキーマ / authenticated ロールが既存のため、
# ローカル用の bootstrap(00_test_bootstrap.sql)は適用しない。
#
# 必要な secret: SUPABASE_DB_URL(Postgres 直接接続文字列)
#   例: postgresql://postgres:<db-password>@db.<ref>.supabase.co:5432/postgres
#   ※ anon / service_role(sb_publishable_ / sb_secret_)は API 層のキーで、
#     DDL 適用には使えない。DB 接続文字列が別途必要。
#
# 前提: 新規プロジェクト(または `supabase db reset` 直後)に対して実行する。
# =====================================================================
set -euo pipefail

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL(Postgres接続文字列)を設定してください}"
PSQL=(psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

for f in 0001_init 0002_rls 0003_grants; do
  echo "▶ migration $f"
  "${PSQL[@]}" -f "$ROOT/supabase/migrations/$f.sql"
done

echo "▶ seed"
"${PSQL[@]}" -f "$ROOT/supabase/seed.sql"

echo "▶ RLS 実機テスト(権限別3ユーザー)"
"${PSQL[@]}" -f "$ROOT/supabase/test/rls_test.sql"

echo "✅ ホスト Supabase での RLS 実機テスト 完了"
