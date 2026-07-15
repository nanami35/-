-- =====================================================================
-- ロール権限付与(要件10/18)
-- Supabase 方式: authenticated ロールへ広く GRANT し、実際のアクセスは
-- RLS(0002)で制限する。anon は参照不可のまま。
-- authenticated / anon ロールは Supabase 本番に既存。テスト環境では
-- supabase/test/00_test_bootstrap.sql が同名ロールを用意する。
-- =====================================================================

grant usage on schema public to authenticated;
grant usage on schema auth to authenticated;

-- 既存テーブルへの権限(RLS で行レベル制御)
grant select, insert, update on all tables in schema public to authenticated;

-- RLS 判定関数の実行権限
grant execute on all functions in schema public to authenticated;
grant execute on function auth.uid() to authenticated;

-- 以後に作成されるオブジェクトへのデフォルト権限
alter default privileges in schema public grant select, insert, update on tables to authenticated;
alter default privileges in schema public grant execute on functions to authenticated;
