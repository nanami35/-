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

## 本番(Supabase)構成への切り替え

1. Supabase プロジェクトを作成し、`supabase/migrations/*.sql` を適用
   (`0001_init.sql`: スキーマ / `0002_rls.sql`: Row Level Security + pgvector)。
2. `.env.local` に Supabase 接続情報を設定し、`DATA_SOURCE=supabase`。
3. `AI_PROVIDER` と各 API キーを設定すると、RAG が実 API + pgvector で動作。

アプリ層の可視性ロジック(`src/lib/rbac.ts` の `canView`)と RLS の `can_view()`
関数は同じ判定になるよう対応付けています。

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
