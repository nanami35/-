# Supabase 連携セットアップ手順

このドキュメントは、デモ（モックデータ）から **Supabase をバックエンドとする本番構成**へ切り替える手順と、
必要な環境変数、認証、Row Level Security(RLS)、データ移行について説明します。

## アーキテクチャ概要

データソースと認証は **環境変数の有無で自動的に切り替わります**（`src/lib/env.ts`）。

| 状態 | データソース | 認証 |
| --- | --- | --- |
| `DATABASE_URL` 未設定 | インメモリのサンプルデータ（デモ） | デモ用アカウント選択 |
| `DATABASE_URL` 設定済み | Supabase / PostgreSQL（Prisma） | — |
| `NEXT_PUBLIC_SUPABASE_URL`＋`ANON_KEY` 設定済み | — | Supabase Auth（メール/パスワード） |

UI（画面）は一切変更されません。切り替えの境界は次の2つです。

- データ: `src/lib/data.ts` → `src/lib/repo/`（`mock-repo` ／ `prisma-repo`）
- 認証: `src/lib/auth.ts` → `src/lib/supabase/`

```
UI(pages) ── @/lib/data(async) ──┬── mock-repo（サンプルデータ）
                                 └── prisma-repo（Supabase/PostgreSQL, organizationId でスコープ）

UI(pages) ── @/lib/auth ──────────┬── デモ Cookie
                                  └── Supabase Auth（セッション Cookie）
```

---

## 環境変数の説明（すべて）

`.env.example` を `.env` にコピーして設定します（`cp .env.example .env`）。

### データベース（Prisma → Supabase PostgreSQL）

| 変数 | 必須 | 説明 | 取得場所 |
| --- | --- | --- | --- |
| `DATABASE_URL` | ○ | アプリ実行時の接続文字列。**コネクションプーラー（PgBouncer, port 6543）** を使用し、末尾に `?pgbouncer=true` を付ける。サーバーレス/多数接続に強い。 | Supabase → Project Settings → Database → Connection string → **Transaction** |
| `DIRECT_URL` | ○ | マイグレーション用の**直結**（port 5432）。`prisma migrate` はプールを介さない接続が必要なため使用。 | 同上 → **Session**（またはDirect connection） |

> `DATABASE_URL` が設定されている＝アプリは Supabase を参照します。未設定ならデモのまま動作します。

### Supabase（認証・クライアント・ストレージ）

| 変数 | 必須 | 説明 | 取得場所 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ○(認証時) | プロジェクトの API URL。ブラウザにも露出する公開値。 | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ○(認証時) | 匿名（公開）キー。RLS 前提で公開してよい値。 | Project Settings → API → Project API keys → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | 任意 | **サーバー専用**。RLS を無視できる強力なキー。管理バッチやサーバー側の特権処理でのみ使用し、**絶対にフロントに露出しない**（`NEXT_PUBLIC_` を付けない）。 | Project Settings → API → `service_role` |

### アプリ設定

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | 任意 | アプリ表示名。 |
| `NEXT_PUBLIC_APP_URL` | 任意 | 本番URL（メールリンク等の基準）。 |
| `MAX_UPLOAD_MB` | 任意 | ファイルアップロード上限（MB）。既定 10。 |

### AI 連携（Phase 3・任意）

| 変数 | 説明 |
| --- | --- |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | AI 機能接続用。未設定ならモック動作。 |
| `AI_PROVIDER` | `anthropic` / `openai` / `mock`。 |

> **秘密情報の扱い**: `NEXT_PUBLIC_` 接頭辞の変数のみブラウザに露出します。
> `DATABASE_URL` / `DIRECT_URL` / `SUPABASE_SERVICE_ROLE_KEY` / AI キーは接頭辞を付けず、サーバー専用に保ちます。

---

## セットアップ手順

### 1. Supabase プロジェクト作成
[supabase.com](https://supabase.com/) でプロジェクトを作成し、上記の接続情報を `.env` に設定します。

### 2. スキーマの反映

Prisma スキーマ（`prisma/schema.prisma`）から生成した SQL を適用します。方法はどちらでも可。

**方法A: Prisma で反映（推奨）**
```bash
npm run db:generate      # Prisma Client 生成
npx prisma migrate deploy   # もしくは開発中は: npm run db:push
```

**方法B: SQL を直接適用**
Supabase ダッシュボードの SQL Editor で以下を順に実行します。
```
supabase/migrations/0001_init.sql          # テーブル・enum・インデックス
supabase/migrations/0002_auth_and_rls.sql  # 認証連携 + RLS
```
（`supabase` CLI 利用時は `supabase db push` でも可）

### 3. RLS と認証連携（0002 の内容）

`0002_auth_and_rls.sql` が以下を行います。

- `public.current_org_id()` / `current_user_role()` / `is_admin()`（SECURITY DEFINER）を作成
- 全業務テーブルで **RLS を有効化**し、`"organizationId" = current_org_id()` の分離ポリシーを付与
- `organizations` は `id = current_org_id()` で分離
- テンプレート系（`diagnosis_categories` / `diagnosis_items` / `kpi_definitions`）は**参照は同一org全員・書込は管理者のみ**
- `auth.users` への INSERT 時、**メール一致で `public.users.authUserId` を自動リンク**するトリガー

> **アプリ本体のテナント分離**: 社内アプリは Prisma で `postgres` ロール（BYPASSRLS）接続のため、RLS はアプリ内クエリには効きません。アプリ側は `src/lib/data.ts` の `createPrismaRepo(orgId)` が全クエリを `organizationId` でフィルタしてテナント分離します。RLS は PostgREST(anon/authenticated) 経由や将来のクライアントポータルに対する**多層防御**です。

### 4. サンプルデータの投入（モックデータの移行）

```bash
npm run db:seed
```
`prisma/seed.ts` が `src/lib/sample-data.ts` の架空データ（サンプルダイニング / HIKARI 等）を
そのままの id・関連で Supabase に投入します。既存データは冒頭で削除してから再投入します（開発用）。

### 5. ログインユーザーの用意（認証）

アプリユーザー（`public.users`）は seed で作成済みですが、`authUserId` は未リンクです。
以下のいずれかで Supabase Auth のアカウントを用意すると、**メール一致トリガー**で自動的に紐付きます。

- ダッシュボード: Authentication → Users → **Add user**（`admin@example.com` 等、seed と同じメール）
- あるいは招待メール送信

作成した auth ユーザーのメールが `public.users.email` と一致すれば、次回サインイン時にそのユーザーとしてログインできます。

> 新しい社員は「Supabase Auth でアカウント作成 ＋ `public.users` に同一メールの行（organization_id・role 付き）を用意」で運用します。将来は管理画面の「ユーザー招待」から自動化します。

### 6. 起動

```bash
npm run dev
```
`DATABASE_URL` と `NEXT_PUBLIC_SUPABASE_URL` が設定されていれば、
ログイン画面はメール/パスワード認証になり、データは Supabase から読み込まれます。

---

## トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| ログインしても弾かれる | `public.users` に auth ユーザーと同じメールの行があるか、`authUserId` がリンクされたか確認。 |
| データが空で表示される | ログインユーザーの `organizationId` と、データの `organizationId` が一致しているか確認（RLS/スコープ）。 |
| `prisma migrate` が失敗 | `DIRECT_URL`（port 5432 直結）が正しいか確認。プーラー(6543)では migrate 不可。 |
| RLS で 0 件になる | ポリシーは `current_org_id()` に依存。認証済みか、`public.users` の行が正しいか確認。 |
