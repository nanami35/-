# 実装手順の分解 & 実装上のリスク・注意点 — 飲食店マーケティングOS

本ドキュメントは、MVP実装を粒度の細かい順序付きステップに分解し、実装上のリスクと注意点をまとめる。

---

## 1. MVP実装ステップ（順序付き）

### STEP 0：プロジェクト初期化
1. Next.js（App Router）+ TypeScript プロジェクト作成。
2. Tailwind CSS 設定、`globals.css` にエントリ追加。
3. shadcn/ui 風UIキットの基礎（button, input, card, table, dialog, badge, form）を用意。
4. ESLint / Prettier / tsconfig の strict 設定（`noImplicitAny`, `strictNullChecks` 有効）。
5. ディレクトリ骨格（`src/app`, `src/components`, `src/lib`, `src/types`）作成。

### STEP 1：型・定数・モックデータ
6. `src/types/models.ts`, `enums.ts` にドメインモデル型を定義。
7. `src/lib/constants.ts` にメニュー定義・ステータス・ロール・チャネルを定義。
8. `src/lib/sample-data/*` にモックデータを整備（組織・ユーザー・クライアント・店舗・診断など）。
9. `src/lib/data/*`（DAL）をモック実装で用意（`organizationId` 引数を必須に）。

### STEP 2：レイアウトと認証ガード
10. ルートレイアウト（`src/app/layout.tsx`）とプロバイダ設定。
11. `(auth)` レイアウト + `/login`（Supabase Auth）。
12. `(app)` レイアウト：サイドバー・ヘッダー・認証ガード（未認証は `/login` へ）。
13. `src/lib/auth/session.ts`, `guard.ts`（現在ユーザー・組織取得、`requireRole()`）。
14. サイドバーを constants から生成し、ロールでメニューを絞る。

### STEP 3：ダッシュボード
15. `/dashboard`：注意店舗カード・期限超過タスク・KPI進捗・担当クライアント一覧。
16. `loading.tsx` / `error.tsx` / 空状態を各セクションに用意。

### STEP 4：クライアント・店舗
17. `/clients` 一覧（検索・絞り込み・ページネーション）。
18. `/clients/[id]` 詳細（基本情報・契約・紐づく店舗・活動履歴）。
19. クライアント作成・編集フォーム（React Hook Form + Zod）。
20. `/stores` 一覧、`/stores/[id]` 詳細（タブ構成の器を用意）。
21. 店舗作成・編集フォーム、クライアントへの紐づけ。

### STEP 5：ヒアリング・診断
22. `/hearings`：テンプレート項目に基づくセクション分割フォーム、保存・閲覧。
23. `diagnosis_categories` / `diagnosis_items` のテンプレート読み込み。
24. `/diagnoses`：項目スコアリングUI、`diagnosis_scores` の縦持ち保存。
25. `components/charts/radar-chart.tsx`（Recharts）でカテゴリスコアを可視化。
26. 診断履歴の時系列比較。

### STEP 6：課題・戦略・KPI・施策・タスク
27. `/issues`：課題の登録・優先度・診断との紐づけ。
28. `/strategies`：戦略登録、課題との紐づけ。
29. `/kpi`：KPI定義 + 月次実績入力、`kpi-trend-chart.tsx` で時系列表示。
30. `/initiatives`：施策登録、KPI・戦略との紐づけ、チャネル別。
31. `/tasks`：タスク作成・担当・期限・ステータス、期限超過ハイライト、施策への紐づけ。

### STEP 7：月次レポート
32. `/reports`：レポート作成、KPI実績・施策結果の取り込み。
33. 下書き → 編集 → 承認（status: draft/review/approved）フロー。
34. PDF出力。

### STEP 8：権限・仕上げ
35. RBAC（admin/marketer）の画面・ボタン・ルート3層ガード。
36. `activity_logs` 記録、`deleted_at` 論理削除の徹底。
37. 全画面のローディング・エラー・空状態の最終確認。
38. （Phase 1.5）Prisma スキーマ実装、RLS 有効化、DAL を本番接続へ差し替え。

---

## 2. リスク・注意点

### 2.1 Supabase接続前提のためデモはモックデータ層で動作させる
- 本番はSupabase/Prisma接続だが、デモ・初期開発段階では実接続が未整備な場合がある。
- **対策**: DAL（`src/lib/data/*`）でモックと本番を環境フラグ（`USE_MOCK`）で切替可能にする。画面はDALのみに依存させ、接続方式の変更が画面に波及しないようにする。

### 2.2 RLS設計
- RLSポリシーの不備はテナント越境（他組織データ漏洩）に直結する。
- **対策**: 全テーブルでRLSをONにし、`organization_id` 一致を必須ポリシーにする。ロール別のread/writeを分けて定義。アプリ層でも `organizationId` を全クエリに付与し二重防御。ポリシーはテストケースで検証する。

### 2.3 大量項目フォームのUX
- ヒアリング・診断は項目数が多く、単一の長大フォームは離脱・入力ミスを招く。
- **対策**: セクション分割、ステップ/アコーディオン、進捗表示、下書き自動保存、未入力バリデーションの明示。React Hook Form で再レンダリングを最適化。

### 2.4 診断項目の可変性
- 診断のカテゴリ・項目は組織ごとに異なり、追加・並び替え・重み変更が発生する。
- **対策**: `diagnosis_categories` / `diagnosis_items` をテンプレートとしてDB管理し、スコアは `diagnosis_scores` に縦持ち（item_id参照）。項目追加で行が増えるだけの構造にし、カラム追加を不要にする。過去診断は当時の項目構成を保持できるよう `diagnosis_scores` に item のスナップショット（ラベル等）を持たせることも検討。

### 2.5 KPIの月次時系列
- KPIは「定義（目標）」と「月次実績」を分けて時系列で扱う必要がある。
- **対策**: `kpi_definitions`（定義・目標値）と `kpi_records`（`period_month` + `actual_value`）に分離。`period_month` は月初日で正規化し、ユニーク制約（definition + month）を付与。目標対比・推移をRechartsで可視化。

### 2.6 PDF出力
- 月次レポートのPDF化はレイアウト崩れ・日本語フォント・改ページの考慮が必要。
- **対策**: サーバーサイド生成（例：印刷用HTML → PDF変換）を基本とし、日本語フォントを埋め込む。まずは印刷用CSS + ブラウザ印刷から着手し、要件に応じてサーバー生成へ拡張。

### 2.7 マルチテナントのデータ混在防止
- 集計・一覧・AIプロンプトで他組織データが混入するリスク。
- **対策**: DAL関数の第一引数を常に `organizationId` にし、省略不可にする。RLSで最終防御。AI連携時はプロンプトに含めるデータを当該組織・当該店舗に限定する。テスト用に別組織データを用意し越境しないことを検証。

### 2.8 型安全
- モデル・フォーム・API境界で型がずれると実行時エラーやデータ不整合を招く。
- **対策**: `any` 禁止。Zodスキーマから `z.infer` で型を導出し、フォームとバリデーションの型を単一ソース化。Prisma生成型と `src/types` を整合させる。`unknown` + 絞り込みで外部入力を扱う。

### 2.9 その他の注意
- **論理削除の一貫性**: 参照系クエリに `deleted_at IS NULL` を必ず付与（DAL共通化で漏れ防止）。
- **操作ログ**: 重要な作成・更新・削除は `activity_logs` に記録し、監査可能に。
- **ファイル制限**: 形式・サイズ上限をサーバー側でも検証（クライアント検証のみに依存しない）。
- **承認フロー**: レポート等のステータス遷移は許可された遷移のみに制限（状態機械として管理）。
