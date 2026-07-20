-- =====================================================================
-- テスト/CI 専用ブートストラップ(本番 Supabase では不要)
-- 目的: プレーンな PostgreSQL 上で、Supabase が提供する最小限の
--       `auth` スキーマ・`auth.users`・`auth.uid()`・`authenticated` ロールを
--       再現し、本番と同一のマイグレーション/RLS をそのまま検証できるようにする。
-- 本番 Supabase には既に auth スキーマと同名関数が存在するため、この
-- ファイルは適用しない(migrations には含めず supabase/test 配下に置く)。
-- =====================================================================

create schema if not exists auth;

-- Supabase の auth.users を模した最小テーブル(FK 先として使用)
create table if not exists auth.users (
  id uuid primary key,
  email text
);

-- Supabase 本番と同じ定義: request.jwt.claims の sub を現在ユーザーとする
create or replace function auth.uid() returns uuid as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
$$ language sql stable;

-- Supabase のクライアントアクセス用ロール。RLS はこのロールに対して適用される。
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
end $$;
