# ディレクトリ構成 — 飲食店マーケティングOS

本ドキュメントは、Next.js App Router を前提としたディレクトリ構成と実装規約を定義する。

---

## 1. ディレクトリツリー

```
飲食店マーケティングOS/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/                     # 未認証レイアウト
│  │  │  ├─ layout.tsx               # 認証用の最小レイアウト
│  │  │  └─ login/
│  │  │     └─ page.tsx              # /login
│  │  │
│  │  ├─ (app)/                      # 認証済みレイアウト（サイドバー付き）
│  │  │  ├─ layout.tsx               # サイドバー・ヘッダー・認証ガード
│  │  │  ├─ dashboard/
│  │  │  │  ├─ page.tsx              # /dashboard
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ error.tsx
│  │  │  ├─ clients/
│  │  │  │  ├─ page.tsx              # /clients
│  │  │  │  └─ [id]/page.tsx         # /clients/[id]
│  │  │  ├─ stores/
│  │  │  │  ├─ page.tsx              # /stores
│  │  │  │  └─ [id]/page.tsx         # /stores/[id]
│  │  │  ├─ hearings/page.tsx        # /hearings
│  │  │  ├─ diagnoses/page.tsx       # /diagnoses
│  │  │  ├─ market/page.tsx          # /market
│  │  │  ├─ competitors/page.tsx     # /competitors
│  │  │  ├─ demand-supply/page.tsx   # /demand-supply
│  │  │  ├─ issues/page.tsx          # /issues
│  │  │  ├─ strategies/page.tsx      # /strategies
│  │  │  ├─ kpi/page.tsx             # /kpi
│  │  │  ├─ initiatives/page.tsx     # /initiatives
│  │  │  ├─ social/page.tsx          # /social
│  │  │  ├─ tasks/page.tsx           # /tasks
│  │  │  ├─ meetings/page.tsx        # /meetings
│  │  │  ├─ reports/page.tsx         # /reports
│  │  │  ├─ knowledge/page.tsx       # /knowledge
│  │  │  ├─ templates/page.tsx       # /templates（admin）
│  │  │  ├─ users/page.tsx           # /users（admin）
│  │  │  └─ settings/page.tsx        # /settings
│  │  │
│  │  ├─ layout.tsx                  # ルートレイアウト（html/body, フォント, Provider）
│  │  ├─ globals.css                 # Tailwind エントリ
│  │  └─ not-found.tsx
│  │
│  ├─ components/
│  │  ├─ ui/                         # 再利用UIキット（shadcn/ui 風）
│  │  │  ├─ button.tsx
│  │  │  ├─ input.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ dialog.tsx
│  │  │  ├─ table.tsx
│  │  │  ├─ badge.tsx
│  │  │  ├─ form.tsx                 # React Hook Form ラッパー
│  │  │  ├─ empty-state.tsx          # 空状態
│  │  │  ├─ loading.tsx              # ローディング/スケルトン
│  │  │  └─ ...
│  │  ├─ layout/                     # レイアウト部品
│  │  │  ├─ sidebar.tsx              # サイドメニュー（メニュー定数を参照）
│  │  │  ├─ header.tsx               # ヘッダー（ユーザー/組織切替）
│  │  │  ├─ page-header.tsx          # 各画面の共通ヘッダー
│  │  │  └─ nav-guard.tsx            # ロール別メニュー制御
│  │  ├─ charts/                     # Recharts ラッパー
│  │  │  ├─ radar-chart.tsx          # 診断レーダー
│  │  │  ├─ kpi-trend-chart.tsx      # KPI時系列
│  │  │  └─ ...
│  │  └─ features/                   # 機能別コンポーネント（任意）
│  │     ├─ clients/
│  │     ├─ diagnoses/
│  │     └─ ...
│  │
│  ├─ lib/
│  │  ├─ data/                       # データアクセス層（DAL）
│  │  │  ├─ clients.ts               # getClients() 等。内部でモック or Prisma を切替
│  │  │  ├─ stores.ts
│  │  │  ├─ diagnoses.ts
│  │  │  └─ ...
│  │  ├─ auth/                       # 認証ヘルパ
│  │  │  ├─ session.ts               # 現在ユーザー・組織取得
│  │  │  └─ guard.ts                 # requireRole() 等
│  │  ├─ supabase/                   # Supabaseクライアント（server/client）
│  │  │  ├─ server.ts
│  │  │  └─ client.ts
│  │  ├─ utils.ts                    # cn() など汎用ユーティリティ
│  │  ├─ constants.ts                # メニュー定義, ステータス, ロール, チャネル等
│  │  ├─ validations/                # Zod スキーマ
│  │  │  ├─ client.ts
│  │  │  ├─ diagnosis.ts
│  │  │  └─ ...
│  │  └─ sample-data/                # モックデータ（デモ・開発用）
│  │     ├─ clients.ts
│  │     ├─ stores.ts
│  │     ├─ diagnoses.ts
│  │     └─ index.ts
│  │
│  └─ types/                         # 型定義
│     ├─ models.ts                   # ドメインモデル型（Prisma型と整合）
│     ├─ enums.ts                    # Role, Status, Channel 等の列挙
│     └─ index.ts
│
├─ prisma/
│  ├─ schema.prisma                  # DBスキーマ定義
│  └─ seed.ts                        # 初期/デモデータ投入
│
├─ docs/                             # 本設計ドキュメント群
│  ├─ 01-requirements.md
│  ├─ 02-mvp-scope.md
│  ├─ 03-screens.md
│  ├─ 04-user-flows.md
│  ├─ 05-er-diagram.md
│  ├─ 06-directory-structure.md
│  ├─ 07-roadmap.md
│  └─ 08-implementation-notes.md
│
├─ public/
├─ .env.local                        # Supabase / DB 接続情報
├─ tailwind.config.ts
├─ tsconfig.json
├─ next.config.ts
└─ package.json
```

---

## 2. 実装規約（コンベンション）

### 2.1 型
- **`any` 禁止**。型が不明な箇所は `unknown` + 絞り込み、またはジェネリクスで対応する。
- ドメインモデル型は `src/types` に集約し、Prisma 生成型（`@prisma/client`）と整合させる。
- API境界・フォーム入力は Zod スキーマで検証し、`z.infer` で型を導出して二重定義を避ける。

### 2.2 データアクセス層（DAL）
- 画面は直接 DB/Supabase を触らず、必ず `src/lib/data/*` を経由する。
- DAL 内部で「モックデータ層（`sample-data`）」と「本番（Prisma/Supabase）」を環境フラグで切替可能にする。これによりデモはモックで動作し、後から実接続へ差し替えられる。
- すべての取得関数は `organizationId` を引数に取り、テナント境界を明示する。

### 2.3 コンポーネント分割
- UIキット（`components/ui`）は状態を持たない再利用部品とする。
- レイアウト（`components/layout`）とチャート（`components/charts`）を分離する。
- 機能固有の複雑なUIは `components/features/<feature>` に置く。
- 1コンポーネント1責務。肥大化したら分割する。

### 2.4 定数管理
- メニュー項目、ステータスラベル、ロール、チャネル種別、色などのマジック値は `src/lib/constants.ts` に集約する。
- サイドバーは constants のメニュー定義を map して描画し、ロールで表示を絞る。

### 2.5 状態表示（必須3状態）
- データ取得を伴う画面・コンポーネントは必ず以下を用意する。
  - **ローディング**: `loading.tsx` / スケルトン。
  - **エラー**: `error.tsx` / エラーバウンダリ。
  - **空状態**: `empty-state.tsx`（データ0件時の案内とCTA）。

### 2.6 命名・その他
- ファイル名は kebab-case、コンポーネントは PascalCase、関数・変数は camelCase。
- サーバーコンポーネントを既定とし、インタラクティブ部分のみ `"use client"` を付与する。
- フォームは React Hook Form + Zod Resolver を標準とする。
