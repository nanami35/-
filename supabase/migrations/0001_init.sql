-- =====================================================================
-- ABENGERS KNOWLEDGE OS - 初期スキーマ(要件14)
-- DATA_SOURCE=supabase(本番)用。PostgreSQL + RLS + pgvector。
-- MVPのインメモリ実装と同じドメインモデルをDBレベルで表現する。
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- --- 列挙型 ----------------------------------------------------------
create type status as enum (
  'draft','ai_processing','pending_review','revision_requested',
  'approved','published','unpublished','needs_recheck','archived'
);
create type visibility as enum (
  'all_staff','seed_group','abengers_only','koeni_only','own_company',
  'managers','executives','project_members','specified_users','admins','private'
);
create type confidence_level as enum ('A','B','C');
create type certainty_level as enum ('confirmed','strong','hypothesis','unverified','needs_check');
create type app_role as enum (
  'super_admin','group_admin','company_admin','approver','editor','member','viewer','guest'
);

-- --- 組織・ユーザー --------------------------------------------------
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  kind text not null check (kind in ('group','company')),
  parent_id uuid references organizations(id),
  created_at timestamptz not null default now()
);

-- Supabase Auth の auth.users を参照するプロフィール
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  organization_id uuid not null references organizations(id),
  role app_role not null default 'member',
  title text,
  is_executive boolean not null default false,
  is_manager boolean not null default false,
  created_at timestamptz not null default now()
);

create table organization_members (
  organization_id uuid references organizations(id),
  user_id uuid references user_profiles(id),
  role app_role not null default 'member',
  primary key (organization_id, user_id)
);

-- --- 共通カラムを持たせるためのマクロ的定義(各主要テーブルで再掲) ---
-- id, organization_id, created_at, updated_at, created_by, updated_by,
-- status, visibility, confidence_level, certainty_level,
-- deleted_at, deleted_by, source_obtained_at, last_verified_at, next_review_at

-- --- 企業図鑑 --------------------------------------------------------
create table companies (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  name text not null,
  name_kana text,
  name_en text,
  website text,
  founded_year int,
  representative text,
  founder text,
  location text,
  employees text,
  revenue text,
  operating_profit text,
  listing_status text,
  ticker_code text,
  industry text,
  category text not null default 'other',
  tags text[],
  business_model jsonb not null default '{}',
  analysis jsonb not null default '{}',
  application jsonb not null default '{}',
  status status not null default 'draft',
  visibility visibility not null default 'all_staff',
  confidence_level confidence_level not null default 'C',
  certainty_level certainty_level not null default 'needs_check',
  source_obtained_at date,
  last_verified_at date,
  next_review_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id)
);

-- --- ビジネスモデル図鑑 ---------------------------------------------
create table business_models (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  name text not null,
  definition text,
  data jsonb not null default '{}',
  tags text[],
  status status not null default 'draft',
  visibility visibility not null default 'all_staff',
  confidence_level confidence_level not null default 'C',
  certainty_level certainty_level not null default 'needs_check',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz
);

-- --- ノウハウ / 事例 / プロジェクト / 会議(共通形状) ---------------
create table knowledge_articles (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  title text not null,
  category text,
  data jsonb not null default '{}',
  tags text[],
  status status not null default 'draft',
  visibility visibility not null default 'all_staff',
  confidence_level confidence_level not null default 'C',
  certainty_level certainty_level not null default 'hypothesis',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz
);

create table case_studies (like knowledge_articles including all);
create table projects (like knowledge_articles including all);
create table meetings (like knowledge_articles including all);
create table people (like knowledge_articles including all);
create table sources (like knowledge_articles including all);

-- --- 比較マトリクス --------------------------------------------------
create table comparison_matrices (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  name text not null,
  description text,
  target_kind text not null,
  target_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id)
);
create table comparison_items (
  id uuid primary key default uuid_generate_v4(),
  matrix_id uuid not null references comparison_matrices(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);
create table comparison_scores (
  matrix_id uuid not null references comparison_matrices(id) on delete cascade,
  target_id text not null,
  item_id uuid not null references comparison_items(id) on delete cascade,
  symbol text not null,
  note text,
  source text,
  primary key (matrix_id, target_id, item_id)
);

-- --- ドキュメント / チャンク / 埋め込み(RAG, 要件15) --------------
create table documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  source_entity_type text,
  source_entity_id uuid,
  title text,
  storage_path text,
  created_at timestamptz not null default now()
);
create table document_chunks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  organization_id uuid not null,
  content text not null,
  -- チャンクのメタデータ(要件15)
  entity_type text,
  entity_id uuid,
  company_id uuid,
  project_id uuid,
  visibility visibility not null default 'all_staff',
  confidence_level confidence_level,
  certainty_level certainty_level,
  source_obtained_at date,
  last_verified_at date,
  source_url text,
  tags text[],
  approved boolean not null default false,
  embedding vector(1536)
);
create index on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- --- 付帯テーブル ----------------------------------------------------
create table comments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  entity_type text not null,
  entity_id uuid not null,
  author_id uuid references user_profiles(id),
  body text not null,
  parent_id uuid references comments(id),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  user_id uuid not null references user_profiles(id),
  level text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create table favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);
create table reading_histories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  viewed_at timestamptz not null default now()
);
create table revision_histories (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null,
  entity_id uuid not null,
  changed_by uuid references user_profiles(id),
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  user_id uuid references user_profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  detail text,
  created_at timestamptz not null default now()
);

-- 更新時刻トリガ
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

do $$ declare t text;
begin
  foreach t in array array['companies','business_models','knowledge_articles','case_studies','projects','meetings','people','sources']
  loop
    execute format('create trigger trg_%s_updated before update on %I for each row execute function set_updated_at();', t, t);
  end loop;
end $$;
