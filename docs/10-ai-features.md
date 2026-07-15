# AI機能（下書き生成・人間承認フロー）

飲食店マーケティングOS の AI 機能は、**モックまたは拡張可能な構造**で実装されており、
`ANTHROPIC_API_KEY` を設定するだけで **Claude（Anthropic API）** に接続されます。
未設定でもデモとして動作します（コンテキストから雛形を生成）。

## 設計方針（重要）

- **AI生成物は必ず「下書き」**。そのまま保存・送付しません。
  担当者が数値・事実を確認し、**編集・承認**したうえで各機能に反映します（human-in-the-loop）。
- **プロバイダ抽象**（`src/lib/ai/provider.ts`）で実装を差し替え可能。
  - `ANTHROPIC_API_KEY` あり → Claude（公式 SDK `@anthropic-ai/sdk`、既定モデル `claude-opus-4-8`）
  - なし / `AI_PROVIDER=mock` → モック生成（オフライン・デモ）
  - OpenAI 等は `provider.ts` にプロバイダを追加して組み込み可能
- **APIキーはサーバー専用**。生成は Route Handler（`/api/ai/generate`）で実行し、
  フロントに鍵を露出しません。コンテキストはサーバー側でデータ層から org スコープで収集します。

## アーキテクチャ

```
[画面のAIボタン / AIアシスタント画面]
        │  fetch POST { task, storeId, month, freeInput }
        ▼
/api/ai/generate (Route Handler, 認証必須・org スコープ)
        │
        ▼
src/lib/ai/service.ts  ── コンテキスト収集（data.ts）＋プロンプト組み立て
        │
        ▼
src/lib/ai/provider.ts ──┬── Anthropic（Claude, @anthropic-ai/sdk）
                         └── モック（service.ts の buildMockDraft）
        │
        ▼
下書き(Markdown) ─→ 画面で編集 ─→ 承認（デモでは保存しない）
```

## 対応タスク

`src/lib/ai/tasks.ts` に定義。AIアシスタント画面（`/ai`）から店舗を選んで実行できます。

| タスク | 内容 |
| --- | --- |
| ヒアリング要約 | 初回ヒアリングの要点整理 |
| 店舗課題の抽出 | ヒアリング＋診断から課題候補を抽出 |
| 5つの価値分析の補助 | 診断結果の考察 |
| 課題の優先順位提案 | 影響度×緊急度×難易度の観点で提案 |
| マーケティング戦略案 | 目標・ターゲット・センターピン・売上分解を含む草案 |
| KPI候補の提案 | 重点KPIと目標水準の考え方 |
| 施策案の作成 | 課題・戦略に基づく具体施策 |
| リール台本の作成 | フック・構成・テロップ・キャプション・ハッシュタグ |
| 口コミ分析 | 貼り付けた口コミの傾向・改善アクション |
| 月次レポート下書き | 12構成のレポート草案（KPI・施策連動） |
| 数値変化の原因仮説 | KPI推移からの仮説と検証方法 |
| 来月の改善案 | 直近成果からの重点施策提案 |

月次レポート詳細（`/reports/[id]`）には「AIでレポート下書き生成」を組み込み済みです。

## 有効化の手順

1. `.env` に `ANTHROPIC_API_KEY` を設定（任意で `AI_MODEL`）。
   ```bash
   ANTHROPIC_API_KEY="sk-ant-..."
   # AI_MODEL="claude-opus-4-8"   # 既定
   ```
2. アプリを再起動。AIアシスタント画面のバッジが「AI接続: 有効」になります。
3. 未設定のままでもモック生成で動作確認できます。

## 環境変数

| 変数 | 説明 |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude 接続用（サーバー専用・非公開）。未設定ならモック。 |
| `AI_MODEL` | 使用モデル。未設定なら `claude-opus-4-8`。 |
| `AI_PROVIDER` | `mock` を指定するとキーがあっても強制的にモック。 |
| `OPENAI_API_KEY` | OpenAI 実装を追加する場合の拡張ポイント。 |

## 拡張（OpenAI 等の追加）

`src/lib/ai/provider.ts` の `getAiProvider()` に分岐を追加し、
`AiProvider` インターフェース（`generate(system, user)`）を満たすプロバイダを実装します。
`service.ts` のプロンプト・コンテキスト収集は共通で再利用できます。
