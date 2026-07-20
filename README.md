# ABENGERS KNOWLEDGE OS

> **価値ある事業を創造・成長させるための、社内経営ナレッジ基盤**
>
> ABENGERS・コエニ・SEED グループが、経営ナレッジ・企業研究・成功/失敗事例・
> 社内プロジェクト・意思決定を一元管理し、検索・比較・AI 相談できる「社内経営 OS」。

Next.js (App Router) + TypeScript + Tailwind CSS で構築。**外部 DB・AI API が無くても
ローカルで即起動**し、主要機能(企業図鑑・比較マトリクス・ノウハウ・AI 検索など)が動作します。

---

## クイックスタート

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の用意(そのままで即起動できます)
cp .env.example .env.local

# 3. 開発サーバー起動
npm run dev
# → http://localhost:3000
```

`.env.example` の初期値は `DATA_SOURCE=seed`(インメモリ)・`AI_PROVIDER=mock` のため、
**追加設定なしでシードデータ入りの全画面**を確認できます。

### デモアカウント(パスワードは全て `password`)

| ロール | メールアドレス |
| --- | --- |
| スーパー管理者 | `admin@abengers.jp` |
| 承認者 | `approver@abengers.jp` |
| 編集者(ABENGERS) | `editor@abengers.jp` |
| 編集者(コエニ) | `marketer@koeni.jp` |
| 閲覧専用 | `viewer@abengers.jp` |

> ロールによって閲覧できる情報が変わります(例: 閲覧専用ユーザーはプロジェクトメンバー
> 限定情報を閲覧できません)。権限はフロント表示だけでなくデータ取得層でも強制されます。

---

## 主な機能(MVP / 要件16)

- 認証・組織/ユーザー/権限管理・監査ログ
- ダッシュボード(統計・注目企業・承認待ち・応用候補・要再確認・通知)
- **企業図鑑**(概要/ビジネスモデル/経営分析/成功失敗/自社への応用 … タブ表示)
- **人物図鑑・ビジネスモデル図鑑**
- **比較マトリクス**(◎○△×、CSV / 印刷(PDF)/ 営業説明テキスト出力)
- **ノウハウライブラリ**(Markdown 対応)・**成功/失敗事例**・**社内プロジェクト**・会議記録
- **情報取り込み → AI 抽出 → 人間が確認 → 承認 → 公開**(承認フロー)
- **全文検索・AI 検索(RAG)**(出典・信頼度・確定度・推論注記つき)
- お気に入り・閲覧履歴・通知・コメント・更新履歴・情報ソース管理

### 品質属性(要件9)

すべての情報に **信頼度 A/B/C**・**確定度(確定/有力/仮説/未検証/要確認)**・
**ステータス** を付与し、一覧・詳細で一目で分かるよう表示します。
ABENGERS/コエニは指示書の定義を反映、その他のベンチマーク企業は未検証内容を断定せず
「要確認/仮説」で登録しています。

---

## 環境変数

| 変数 | 既定 | 説明 |
| --- | --- | --- |
| `DATA_SOURCE` | `seed` | `seed`=インメモリ / `supabase`=PostgreSQL+RLS+pgvector(本番) |
| `AI_PROVIDER` | `mock` | `mock` / `openai` / `anthropic` / `gemini`。キー未設定時は自動で mock |
| `AUTH_SECRET` | (要変更) | セッション署名用シークレット |
| `OPENAI_API_KEY` 他 | — | 各 AI プロバイダーの API キー |
| `NEXT_PUBLIC_SUPABASE_URL` 他 | — | Supabase 接続情報 |

**AI 機能はモックモードと実 API モードを切り替え可能**で、API 未設定でも AI 以外の
主要機能はすべて動作します。

---

## スクリプト

```bash
npm run dev         # 開発サーバー
npm run build       # 本番ビルド
npm run start       # 本番サーバー
npm run typecheck   # TypeScript 型チェック(strict)
npm run test        # 単体テスト(Vitest)
npm run test:e2e    # E2E テスト(Playwright)
npm run lint        # ESLint
```

### テスト実行

```bash
# 単体テスト(権限・検索・AI 切替)
npm run test

# E2E(先に別ターミナルで `npm run build && npm run start`、または dev サーバーを起動)
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

---

## 本番(Supabase)構成への接続手順

アプリ層の可視性ロジック(`src/lib/rbac.ts` の `canView`)と RLS の `can_view()`
関数は同じ判定になるよう対応付けています。接続クライアントは `src/lib/supabase.ts`。

### 1. プロジェクト作成と接続情報

1. [Supabase](https://supabase.com/) でプロジェクトを作成。
2. **Project Settings → API Keys** から**新形式のキー**を取得し `.env.local` に設定:
   ```env
   DATA_SOURCE=supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # anon 相当・公開可
   SUPABASE_SECRET_KEY=sb_secret_...                         # service_role 相当・サーバー専用/秘匿
   ```
   接続文字列(**Project Settings → Database**)を `DATABASE_URL` として控えておく。

   > **キー形式について**: 本アプリは新形式 API キー(`sb_publishable_` / `sb_secret_`)に
   > 対応しています。従来の anon / service_role JWT(`eyJ...`)も後方互換で利用でき、
   > `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` に設定すると
   > 新形式キーが未設定の場合のみ使用されます(`src/lib/supabase.ts`)。
   > secret キーを `NEXT_PUBLIC_...` の公開スロットへ置くと露出防止のため起動時に例外になります。

### 2. マイグレーション + Seed の適用

Supabase CLI を使う場合(推奨):
```bash
supabase link --project-ref <ref>
supabase db push           # supabase/migrations/*.sql を適用
supabase db seed           # supabase/seed.sql(または psql で seed.sql を実行)
```

CLI を使わず psql で直接適用する場合:
```bash
# 本番 Supabase には auth スキーマが既存のため bootstrap は不要
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_rls.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_grants.sql
psql "$DATABASE_URL" -f supabase/seed.sql
```

> 本番(ホスト型)では、`user_profiles` に紐づくユーザーは Supabase Auth 経由で
> 作成します(`seed.sql` の `auth.users` への INSERT はローカル/CI 用)。

### 3. RLS の実機テスト(権限別ユーザー3種)

実 PostgreSQL + pgvector に対して、マイグレーション → Seed → RLS 検証を一括実行:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" \
  bash supabase/test/run.sh
```
`super_admin / editor(コエニ) / viewer(ABENGERS)` の3ユーザーで RLS が行を
正しく絞り込むこと(可視件数 5 / 1 / 2 など)を assertion 付きで検証します。
このテストは GitHub Actions の `db-rls` ジョブとして PR ごとに自動実行されます。

### 4. AI(RAG)

`AI_PROVIDER` と各 API キーを設定すると、RAG が実 API + pgvector(`document_chunks`)で動作します。

---

## Vercel へのデプロイ

1. GitHub リポジトリを [Vercel](https://vercel.com/) にインポート(Framework: **Next.js** を自動検出)。
2. **Settings → Environment Variables** に以下を登録(Production / Preview):
   | Key | 例 | 備考 |
   | --- | --- | --- |
   | `DATA_SOURCE` | `supabase` | 本番は supabase 推奨 |
   | `AUTH_SECRET` | (32文字以上のランダム値) | 必須・秘匿 |
   | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | — | Supabase 接続(publishable, `sb_publishable_…`) |
   | `SUPABASE_SECRET_KEY` | — | サーバー専用・秘匿(secret, `sb_secret_…`)。従来 JWT も後方互換で可 |
   | `AI_PROVIDER` + 各 API キー | `anthropic` 等 | 省略時は mock |
3. デプロイ実行(`main` への push または PR の Preview で自動)。ビルドは `npm run build`。
4. 事前に「本番(Supabase)構成への接続手順」でマイグレーション + Seed を適用しておく。

> `DATA_SOURCE` を省略すると `seed`(インメモリ)で起動するため、DB 未接続でも
> デモ用途としてそのままデプロイ・動作します。

---

## 技術スタック

Next.js 15 (App Router, Server Actions) / React 19 / TypeScript (strict) /
Tailwind CSS / lucide-react / Zod / Vitest / Playwright。
DB(本番): PostgreSQL + Supabase(Auth / Storage / RLS)/ pgvector。

設計の詳細は [`docs/architecture.md`](docs/architecture.md) を参照してください。

---

## ディレクトリ構成

```
src/
  app/            画面(App Router)。login と (app) グループ(認証ガード)
  components/     UI プリミティブ・レイアウト・機能コンポーネント
  lib/            types / auth / rbac / store / queries / search / ai / seed
supabase/migrations/  本番用 SQL(スキーマ + RLS)
docs/architecture.md  設計書
tests/unit, tests/e2e 単体 / E2E テスト
```
