-- =====================================================================
-- Row Level Security(要件10/18)
-- アプリ層(rbac.ts)と同じ可視性ロジックをDBレベルで強制する。
-- 権限のない情報は検索結果・AI回答にも含まれない(document_chunksにも適用)。
-- =====================================================================

-- 現在ユーザーのプロフィールを取得するヘルパー
create or replace function current_profile()
returns user_profiles as $$
  select * from user_profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function current_role_rank() returns int as $$
  select case (select role from user_profiles where id = auth.uid())
    when 'super_admin' then 100
    when 'group_admin' then 90
    when 'company_admin' then 80
    when 'approver' then 60
    when 'editor' then 50
    when 'member' then 30
    when 'viewer' then 20
    when 'guest' then 10
    else 0 end;
$$ language sql stable;

create or replace function is_admin() returns boolean as $$
  select current_role_rank() >= 80;
$$ language sql stable;

-- 1行の可視性判定(rbac.ts の matchesVisibility と等価)
create or replace function can_view(
  p_visibility visibility,
  p_org uuid,
  p_created_by uuid,
  p_status status,
  p_deleted_at timestamptz
) returns boolean as $$
declare
  me user_profiles;
begin
  select * into me from user_profiles where id = auth.uid();
  if me is null then return false; end if;

  if p_deleted_at is not null then return is_admin(); end if;

  -- 下書き/AI整理中は作成者と承認者以上のみ
  if p_status in ('draft','ai_processing')
     and p_created_by <> me.id and current_role_rank() < 60 then
    return false;
  end if;
  if p_status in ('unpublished','archived')
     and p_created_by <> me.id and not is_admin() then
    return false;
  end if;

  if is_admin() then return true; end if;

  return case p_visibility
    when 'all_staff' then true
    when 'seed_group' then true
    when 'abengers_only' then (select slug from organizations where id = me.organization_id) = 'abengers'
    when 'koeni_only' then (select slug from organizations where id = me.organization_id) = 'koeni'
    when 'own_company' then me.organization_id = p_org
    when 'managers' then me.is_manager
    when 'executives' then me.is_executive
    when 'project_members' then me.organization_id = p_org and (me.is_manager or current_role_rank() >= 50)
    when 'specified_users' then p_created_by = me.id
    when 'admins' then is_admin()
    when 'private' then p_created_by = me.id
    else false end;
end;
$$ language plpgsql stable security definer;

-- RLS有効化 + ポリシー(主要テーブル)
do $$ declare t text;
begin
  foreach t in array array['companies','business_models','knowledge_articles','case_studies','projects','meetings','people','sources']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format($f$
      create policy sel_%1$s on %1$I for select using (
        can_view(visibility, organization_id, created_by, status, deleted_at)
      );
    $f$, t);
    -- 編集者以上のみ作成・更新可
    execute format($f$
      create policy ins_%1$s on %1$I for insert with check (current_role_rank() >= 50);
    $f$, t);
    execute format($f$
      create policy upd_%1$s on %1$I for update using (current_role_rank() >= 50);
    $f$, t);
  end loop;
end $$;

-- ドキュメントチャンク: 承認済み かつ 可視性を満たすもののみ検索対象
alter table document_chunks enable row level security;
create policy sel_chunks on document_chunks for select using (
  approved and can_view(visibility, organization_id, created_by := auth.uid(), p_status := 'published', p_deleted_at := null)
);

-- 個人データ(お気に入り・履歴・通知)は本人のみ
alter table favorites enable row level security;
create policy own_favorites on favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
alter table reading_histories enable row level security;
create policy own_history on reading_histories for all using (user_id = auth.uid()) with check (user_id = auth.uid());
alter table notifications enable row level security;
create policy own_notifications on notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 監査ログは管理者のみ閲覧
alter table audit_logs enable row level security;
create policy sel_audit on audit_logs for select using (is_admin());
create policy ins_audit on audit_logs for insert with check (true);
