# ABENGERS KNOWLEDGE OS — 設計書 (architecture.md)

> 価値ある事業を創造・成長させるための、社内経営ナレッジ基盤。
> 本書は要件定義書 第20章 Step2 に基づく設計記録です。

## 0. 前提と合理的な仮定

実装環境に Supabase インスタンスが常設されていないため、**データ層を抽象化**し
2 系統で動作する構成としました(要件19「AI 未設定でも主要機能が動く」を DB にも適用)。

| 仮定 | 対応 |
| --- | --- |
| ローカルで外部 DB なしに即起動したい | `DATA_SOURCE=seed` でインメモリ実装(シードデータ)で起動 |
| 本番は Supabase(PostgreSQL + RLS + pgvector) | `DATA_SOURCE=supabase` 用の SQL マイグレーションを `supabase/migrations` に用意 |
| AI API キーが無い環境でもデモしたい | `AI_PROVIDER=mock` で RAG/要約/抽出をモック動作。キー設定で実 API に切替 |
| 認証は MVP では簡易に | 署名付き Cookie セッション。本番は Supabase Auth に差し替え(同一インターフェイス) |

いずれの仮定も、**本番構成へ差し替えやすいインターフェイス**で分離しています。

### 0.1 仮定の検証結果(PR #2 レビュー対応)

上記の仮定について、マージ前に以下を実機検証しました(詳細は §7 末尾)。

| 仮定 | 検証方法 | 結果 |
| --- | --- | --- |
| 本番は Supabase(PG + RLS + pgvector) | 実 PostgreSQL 16 + pgvector 0.6.0 に `0001→0002→0003` を適用 | ✅ マイグレーション適用成功 |
| RLS がアプリ層 `canView` と同じ判定になる | `authenticated` ロールで3ロールのユーザーに切替え、RLS 実機テスト(9 assertion) | ✅ 可視件数 5/1/2 で一致・合格 |
| Seed で主要データを投入できる | `supabase/seed.sql` を実 DB に投入 | ✅ 投入成功 |
| CI で品質を自動担保 | GitHub Actions で typecheck/build/Vitest/Playwright/RLS を PR ごと実行 | ✅ `.github/workflows/ci.yml` |
| 実 Supabase 未接続でも動作 | `DATA_SOURCE=seed` で全画面動作(既定) | ✅ |

> 補足: **ホスト型 Supabase プロジェクトへの実接続**(URL/キーの設定)は運用側の
> シークレット登録が前提のため、接続手順を README に確立し、DB/RLS の正しさは
> 上記の実 PostgreSQL 実機テスト(CI で毎回再現)で担保しています。アプリ全体の
> データアクセス層を Supabase 実装へ差し替える作業は次段の対象です。

## 1. 画面一覧(37画面 / 要件11)

ログイン・パスワード再設定・初回プロフィール登録・ダッシュボード・全体検索・AIチャット・
企業(一覧/詳細/登録)・人物(一覧/詳細)・ビジネスモデル(一覧/詳細)・比較マトリクス・
ノウハウ(一覧/詳細/登録)・成功失敗事例(一覧/詳細)・社内プロジェクト(一覧/詳細)・
会議記録(一覧/詳細)・情報登録/取り込み・AI抽出結果確認・承認待ち・更新履歴・情報ソース・
通知・お気に入り/履歴・ユーザー/組織/権限/カテゴリ管理・AI設定・システム設定。

MVP では上記のうち、要件16「MVP で優先する機能」を満たす画面を実装済み。

## 2. ユーザーフロー

```
ログイン
  └─ ダッシュボード ──┬─ 全体検索 ─→ 詳細 / AIチャットへ
                      ├─ 企業図鑑 → 企業詳細(タブ:概要/BM/分析/成功失敗/応用/関連/履歴/コメント)
                      ├─ 比較マトリクス(CSV/PDF/営業テキスト出力)
                      ├─ 情報取り込み → AI抽出 → 人間が確認・修正 → 承認待ち → 承認 → 公開
                      └─ AIチャット(権限内をRAG検索 → 出典付き回答)
```

情報のライフサイクル(要件2の循環):
**外部情報収集 → AI整理 → 人間の検証・承認 → 自社ノウハウ化 → プロジェクト実行 → 成果蓄積 → 経営判断**

## 3. データベース ER 設計(要件14)

主要テーブル: `organizations / user_profiles / organization_members / companies /
business_models / knowledge_articles / case_studies / projects / meetings / people /
sources / comparison_matrices / comparison_items / comparison_scores / documents /
document_chunks(embedding vector) / comments / notifications / favorites /
reading_histories / revision_histories / audit_logs`。

すべての主要テーブルに共通カラム
`id, organization_id, created_at, updated_at, created_by, updated_by, status,
visibility, confidence_level, certainty_level`、および論理削除 `deleted_at/deleted_by`、
鮮度管理 `source_obtained_at / last_verified_at / next_review_at` を付与。

TypeScript のドメイン型は `src/lib/types.ts`、SQL は `supabase/migrations/0001_init.sql`。

## 4. 権限設計(要件10)

- ロール階層(rank): super_admin(100) > group_admin(90) > company_admin(80) >
  approver(60) > editor(50) > member(30) > viewer(20) > guest(10)
- 可視性 `visibility` 11 種を `canView()`(`src/lib/rbac.ts`)で判定。
- **フロントで隠すだけでなくデータ取得層で強制**。`src/lib/queries.ts` は全読み取りを
  `filterViewable()` に通す。本番では **同一ロジックを RLS**(`0002_rls.sql` の
  `can_view()` 関数)で DB レベルに強制。
- AI/検索も `buildDocs(user)` が可視ドキュメントのみを対象とし、**権限外の情報は
  検索結果・AI回答に絶対に含めない**。

## 5. コンポーネント設計

```
src/
  app/
    login/                     … 認証(Server Action)
    (app)/                     … 認証ガード付きレイアウト(Sidebar + Header)
      dashboard, search, chat, companies, people, business-models, compare,
      knowledge, cases, projects, meetings, ingest, approvals, history,
      sources, notifications, favorites, admin, admin/audit
      actions.ts               … 共通 Server Actions(承認/お気に入り/コメント/CRUD)
  components/
    ui/ (badge, card, button, field, tabs, toast, page)  … 再利用プリミティブ
    layout/ (sidebar, header, nav)
    trust-badges, interactive(client), comment-section, markdown, matrix-view
  lib/
    types.ts, labels.ts, cn.ts
    auth.ts(Cookie), rbac.ts(可視性), store.ts(インメモリDB), queries.ts
    search.ts(全文/セマンティック検索の抽象), seed/*(初期データ)
    ai/ provider.ts(プロバイダ切替), rag.ts(RAG + モック回答)
```

## 6. AI 処理フロー(要件15)

1. 取り込み(テキスト/URL/資料)→ 2. テキスト抽出 → 3. 分割(チャンク)→
4. メタデータ付与(entity/company/visibility/confidence…)→ 5. Embedding →
6. pgvector 保存 → 7. AI 要約・分類 → 8. **人間が承認** → 9. 承認済みのみ検索対象。

回答生成: ①権限確認 → ②検索クエリ化 → ③キーワード+ベクトル併用 →
④関連度/信頼度/更新日で並替 → ⑤上位を LLM へ → ⑥**出典付き回答** →
⑦**推論と事実を分離表示**。参照元が無い内容は断定しない/情報不足を明示。

MVP は `AI_PROVIDER=mock` でキーワード検索ベースの RAG を実装(出典・信頼度・推論注記つき)。
`openai / anthropic / gemini` に切替可能(`src/lib/ai/provider.ts`)。

## 7. MVP 実装範囲(要件16)

実装済み: 認証 / 組織・ユーザー・権限 / ダッシュボード / 企業図鑑 / 人物図鑑 /
ビジネスモデル図鑑 / 比較マトリクス(出力含む)/ ノウハウ / 成功失敗事例 / プロジェクト /
会議記録 / URL・資料取り込み + AI 抽出 / 全文・AI 検索 / タグ / 承認フロー / 更新履歴 /
お気に入り・履歴 / 通知 / コメント / 監査ログ / エクスポート(CSV/印刷/テキスト)。

後回し(将来拡張の構造のみ用意): 完全自動巡回、Slack/LINE/Drive 連携、メール通知、
音声自動文字起こし、PowerPoint 自動生成。

### 7.1 マージ前ハードニングの検証結果(PR #2)

| 項目 | 内容 | 状態 |
| --- | --- | --- |
| GitHub Actions | `checks`(typecheck/build/Vitest)・`e2e`(Playwright)・`db-rls`(実PG)を PR ごと自動実行 | ✅ 実装 |
| マイグレーション | 実 PostgreSQL 16 + pgvector 0.6.0 に `0001/0002/0003` を適用し成功 | ✅ 検証済 |
| Seed 投入 | `supabase/seed.sql` を実 DB に投入 | ✅ 検証済 |
| RLS 実機テスト | `authenticated` ロールで **3ロール**(super_admin / editor(コエニ) / viewer(ABENGERS))に切替え、可視件数 5/1/2 ほか計 9 assertion が合格。負のケース(期待不一致)で失敗することも確認 | ✅ 検証済 |
| 接続手順 | Supabase 接続手順を README に確立(CLI / psql の両手順、Auth 連携の注意) | ✅ 文書化 |
| Vercel デプロイ | 環境変数一覧と手順を README に追記 | ✅ 文書化 |

実行方法(ローカル):
`DATABASE_URL=... bash supabase/test/run.sh`
CI では `pgvector/pgvector:pg16` サービスコンテナに対して同スクリプトを実行する。

## 8. テスト

- 単体(Vitest): 権限判定 `rbac`、検索 `search`、AI 切替 `provider`(計 19 ケース)。
- E2E(Playwright): ログイン、認証ガード、企業一覧→詳細タブ、比較マトリクス、
  検索、AIチャットの出典表示、権限による可視性フィルタ(計 7 シナリオ)。
- DB/RLS(psql, 実 PostgreSQL + pgvector): マイグレーション + Seed 適用後、
  3ロールのユーザーで RLS の行フィルタを検証(`supabase/test/rls_test.sql`, 計 9 assertion)。
- 上記すべてを GitHub Actions(`.github/workflows/ci.yml`)で PR ごとに自動実行。

## 9. セキュリティ(要件18)

RLS(本番)/ アプリ層可視性(MVP)、Zod 相当の入力検証、Server Action による CSRF 耐性、
React の自動エスケープ(XSS)、アップロード種別・容量制限、監査ログ、
API キーの環境変数管理、クライアントへ秘密情報を出さない設計。
