-- =====================================================================
-- RLS 実機テスト(要件10/18 / 完成条件「権限別の可視性」)
-- 実 PostgreSQL 上で authenticated ロールとして接続し、3 種のロールの
-- ユーザーに切り替えながら、RLS が期待どおり行を絞り込むかを検証する。
-- 期待に反した場合は RAISE EXCEPTION で失敗する(psql -v ON_ERROR_STOP=1)。
--
-- 実行前提: 00_test_bootstrap.sql → 0001 → 0002 → 0003 → seed.sql 適用済み。
-- =====================================================================

-- RLS は authenticated ロール(非オーナー/非スーパーユーザー)にのみ適用される
set role authenticated;

\echo '--- ユーザーを切替えながら companies の可視件数を検証 ---'

-- ヘルパー: 指定ユーザーとして companies の可視件数を検証
create or replace function pg_temp.expect_company_count(p_user uuid, p_label text, p_expected int)
returns void as $$
declare
  n int;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user)::text, false);
  select count(*) into n from companies;
  if n <> p_expected then
    raise exception 'RLS FAIL [%]: companies 可視件数 = % (期待 %)', p_label, n, p_expected;
  end if;
  raise notice 'RLS OK   [%]: companies 可視件数 = %', p_label, n;
end;
$$ language plpgsql;

-- ヘルパー: 特定企業が見えるか/見えないかを検証
create or replace function pg_temp.expect_visibility(p_user uuid, p_label text, p_company uuid, p_visible boolean)
returns void as $$
declare
  seen boolean;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user)::text, false);
  select exists(select 1 from companies where id = p_company) into seen;
  if seen <> p_visible then
    raise exception 'RLS FAIL [%]: 企業 % の可視性 = % (期待 %)', p_label, p_company, seen, p_visible;
  end if;
  raise notice 'RLS OK   [%]: 企業 % 可視 = %', p_label, p_company, seen;
end;
$$ language plpgsql;

do $$
declare
  u_admin  uuid := '22222222-2222-2222-2222-222222220001'; -- super_admin / ABENGERS / 役員
  u_koeni  uuid := '22222222-2222-2222-2222-222222220002'; -- editor / コエニ
  u_viewer uuid := '22222222-2222-2222-2222-222222220003'; -- viewer / ABENGERS
  c_public   uuid := '33333333-0000-0000-0000-000000000001';
  c_abengers uuid := '33333333-0000-0000-0000-000000000002';
  c_exec     uuid := '33333333-0000-0000-0000-000000000003';
  c_project  uuid := '33333333-0000-0000-0000-000000000004';
  c_draft    uuid := '33333333-0000-0000-0000-000000000005';
begin
  -- 件数(下書きを含む全5件のうち何件見えるか)
  perform pg_temp.expect_company_count(u_admin,  'super_admin',   5); -- 全件(下書きは作成者)
  perform pg_temp.expect_company_count(u_koeni,  'editor(koeni)', 1); -- 全社員公開のみ
  perform pg_temp.expect_company_count(u_viewer, 'viewer(abengers)', 2); -- 公開 + ABENGERSのみ

  -- 個別の可視性(横断チェック)
  perform pg_temp.expect_visibility(u_koeni,  'editor(koeni)',    c_abengers, false); -- 他社はABENGERSのみ情報を見られない
  perform pg_temp.expect_visibility(u_viewer, 'viewer(abengers)', c_abengers, true);  -- 同社なら見られる
  perform pg_temp.expect_visibility(u_viewer, 'viewer(abengers)', c_exec,     false); -- 非役員は役員限定を見られない
  perform pg_temp.expect_visibility(u_viewer, 'viewer(abengers)', c_project,  false); -- 一般はPJ限定を見られない
  perform pg_temp.expect_visibility(u_admin,  'super_admin',      c_exec,     true);  -- 管理者は横断閲覧可
  perform pg_temp.expect_visibility(u_viewer, 'viewer(abengers)', c_draft,    false); -- 他者の下書きは見られない

  raise notice '==== RLS 実機テスト 全ケース合格 ====';
end $$;

reset role;
