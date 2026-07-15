-- ============================================================
-- 認証連携 + Row Level Security (RLS)
-- 0001_init.sql の後に実行すること。
--
-- 方針:
--   * public.users.authUserId が Supabase Auth の auth.users.id を指す。
--   * 現在ユーザーの organization/role を SECURITY DEFINER 関数で解決し、
--     全業務テーブルに「同一 organization のみ」ポリシーを適用する。
--   * SECURITY DEFINER 関数は RLS を回避して users を読むため、
--     users テーブルのポリシーによる無限再帰を防げる。
--
-- 補足（重要）:
--   社内アプリ本体は Prisma で `postgres` ロール接続（BYPASSRLS）のため、
--   RLS はアプリ内クエリには適用されない。アプリ側は data.ts の
--   createPrismaRepo(orgId) で organizationId を明示フィルタしてテナント分離する。
--   RLS は PostgREST(anon/authenticated) 経由アクセスや将来のクライアント
--   ポータルに対する多層防御として機能する。
-- ============================================================

-- ------------------------------------------------------------
-- 1. ヘルパー関数
-- ------------------------------------------------------------
create or replace function public.current_org_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select "organizationId"
  from public.users
  where "authUserId" = auth.uid()::text
    and "deletedAt" is null
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text
  from public.users
  where "authUserId" = auth.uid()::text
    and "deletedAt" is null
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

grant execute on function public.current_org_id() to anon, authenticated;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ------------------------------------------------------------
-- 2. 新規 auth ユーザーを public.users にメールで自動リンク
--    （管理者が招待/作成したユーザーの authUserId を紐付ける）
-- ------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set "authUserId" = new.id::text,
      "updatedAt" = now()
  where email = new.email
    and "authUserId" is null
    and "deletedAt" is null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ------------------------------------------------------------
-- 3. organizations テーブルのポリシー（id = current_org_id）
-- ------------------------------------------------------------
alter table public.organizations enable row level security;
drop policy if exists org_self_select on public.organizations;
create policy org_self_select on public.organizations
  for select using (id = public.current_org_id());

-- ------------------------------------------------------------
-- 4. 業務テーブル一括: RLS 有効化 + organizationId 分離ポリシー
--    SELECT/INSERT/UPDATE/DELETE を同一 organization に限定する。
-- ------------------------------------------------------------
do $$
declare
  t text;
  business_tables text[] := array[
    'users','clients','stores','contracts','client_members','hearings',
    'diagnoses','diagnosis_categories','diagnosis_items','diagnosis_scores',
    'market_analyses','trade_area_analyses','competitors','demand_analyses',
    'supply_analyses','issues','strategies','kpi_definitions','kpi_records',
    'initiatives','social_contents','tasks','task_comments','meetings',
    'meeting_actions','monthly_reports','knowledge_cases','files','activity_logs'
  ];
begin
  foreach t in array business_tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists org_isolation on public.%I;', t);
    execute format($p$
      create policy org_isolation on public.%I
        for all
        using ("organizationId" = public.current_org_id())
        with check ("organizationId" = public.current_org_id());
    $p$, t);
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- 5. （任意）管理者のみ書き込み可能にしたいテーブルの例
--    テンプレート系（診断項目・KPI定義）は管理者のみ編集可能にする。
--    参照は同一 organization の全員に許可。
-- ------------------------------------------------------------
do $$
declare
  t text;
  admin_write_tables text[] := array[
    'diagnosis_categories','diagnosis_items','kpi_definitions'
  ];
begin
  foreach t in array admin_write_tables loop
    execute format('drop policy if exists org_isolation on public.%I;', t);
    -- 参照は同一 org
    execute format($p$
      create policy tmpl_select on public.%I
        for select using ("organizationId" = public.current_org_id());
    $p$, t);
    -- 追加/更新/削除は管理者のみ
    execute format($p$
      create policy tmpl_admin_write on public.%I
        for all
        using ("organizationId" = public.current_org_id() and public.is_admin())
        with check ("organizationId" = public.current_org_id() and public.is_admin());
    $p$, t);
  end loop;
end;
$$;

-- ============================================================
-- 完了。
-- 以降、anon/authenticated ロール経由の全クエリは organization で分離される。
-- ============================================================
