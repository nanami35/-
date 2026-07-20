#!/usr/bin/env bash
# =====================================================================
# RLS 実機テスト ランナー
# 実 PostgreSQL に対して、bootstrap → migrations → grants → seed を適用し、
# RLS テストを実行する。ローカル/CI(postgres サービス)双方で利用可能。
#
# 環境変数 DATABASE_URL(未指定時はローカルの postgres へ接続)。
# =====================================================================
set -euo pipefail

DB_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/abengers_test}"
PSQL=(psql "$DB_URL" -v ON_ERROR_STOP=1 -q)

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "▶ bootstrap (auth schema shim / roles)"
"${PSQL[@]}" -f "$ROOT/supabase/test/00_test_bootstrap.sql"

for f in 0001_init 0002_rls 0003_grants; do
  echo "▶ migration $f"
  "${PSQL[@]}" -f "$ROOT/supabase/migrations/$f.sql"
done

echo "▶ seed"
"${PSQL[@]}" -f "$ROOT/supabase/seed.sql"

echo "▶ RLS 実機テスト"
"${PSQL[@]}" -f "$ROOT/supabase/test/rls_test.sql"

echo "✅ RLS 実機テスト 完了"
