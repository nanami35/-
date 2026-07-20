# 外部連携（アダプタ設計・データ取り込み）

各媒体（Googleビジネス / Instagram / TikTok / LINE / 広告 / POS）のデータ取り込みを、
**共通アダプタ抽象**の背後に設計しました。デモはモックで動作し、環境変数を設定すると
実API接続へ差し替えられる**拡張可能な受け皿**です。取り込みは AI 機能と同じく
**human-in-the-loop**（プレビュー→確認→反映）で、そのまま保存しません。

## アーキテクチャ

```
[外部連携画面 /integrations]  店舗を選択 → 媒体カードの「データを取り込む」
        │  POST { provider, storeId }
        ▼
/api/integrations/sync  (認証必須・org スコープ)
        │
        ▼
src/lib/integrations/ingest.ts  ── syncProvider(): アダプタで取得 → KPI へ正規化
        │
        ▼
registry.ts ──┬── mock-adapter（決定論的モック生成：デモ）
              └── live-adapters（実API接続の拡張点：未実装スタブ）
        │
        ▼
SyncResult（KPI反映候補＋口コミ＋警告）→ 画面でプレビュー → 確認して反映（保存はしない）
```

## 主要ファイル

| ファイル | 役割 |
| --- | --- |
| `src/lib/integrations/types.ts` | アダプタ抽象・スナップショット・同期結果の型 |
| `src/lib/integrations/definitions.ts` | 6媒体の定義と「取り込む指標 → KPI」マッピング |
| `src/lib/integrations/adapter` (types 内 `IntegrationAdapter`) | 媒体共通のアダプタインターフェース |
| `src/lib/integrations/mock-adapter.ts` | 決定論的なモック生成（店舗・月・指標から近似値） |
| `src/lib/integrations/live-adapters.ts` | **実API接続の拡張点**（未実装スタブ） |
| `src/lib/integrations/registry.ts` | env に応じて mock / live を選択、接続状態判定 |
| `src/lib/integrations/ingest.ts` | 取得→KPI正規化、店舗の接続状況一覧 |
| `src/app/api/integrations/sync/route.ts` | 同期API（認証必須） |
| `src/app/(app)/integrations/page.tsx` | 連携画面（媒体カード） |

## 対応媒体と取り込むKPI

| 媒体 | 取り込むKPI（例） | 認証 |
| --- | --- | --- |
| Googleビジネスプロフィール | 検索/マップ表示・ルート検索・通話・口コミ件数/評価 ＋ **口コミ本文** | OAuth |
| Instagram | フォロワー・リーチ・インプレッション・保存・リール再生・経由予約 | OAuth |
| TikTok | フォロワー・再生・いいね・経由予約 | OAuth |
| LINE公式 | 友だち・新規・ブロック・開封率・クリック率・経由予約 | API Key |
| 広告 | 広告費・表示・クリック・CTR・CPA・ROAS | OAuth |
| POSレジ | 売上・客数・客単価・注文点数 | API Key |

## モック / 実接続の切り替え

- 既定は**モック**。`registry.ts` の `isProviderLive()` が env を判定します。
- 各媒体のトークン（`.env`）を設定すると、その媒体が **live** に切り替わります。
  - `GOOGLE_BUSINESS_ACCESS_TOKEN` / `INSTAGRAM_ACCESS_TOKEN` / `TIKTOK_ACCESS_TOKEN` /
    `LINE_CHANNEL_ACCESS_TOKEN` / `ADS_ACCESS_TOKEN` / `POS_API_KEY`
- `INTEGRATION_MODE=mock` で全媒体を強制的にモックにできます。

## 実装の追加（拡張点）

`src/lib/integrations/live-adapters.ts` の `createLiveAdapter` 内で、各媒体の API を呼び出し、
取得した生データを `def.metrics` に沿って `MetricSnapshot`（`{ kpiKey, value }[]`）へ正規化して返します。
Google は `fetchReviews` で口コミを `ReviewItem[]` として返します。
定義（`definitions.ts`）の `metrics` に KPI キーを追加するだけで、取り込み対象を拡張できます。

## 取り込み後の反映（human-in-the-loop）

同期は数値を**プレビュー**として返すのみで保存しません。担当者が内容を確認し、
「KPIに反映（確認）」で KPI レコードへ反映する設計です（本デモでは永続化しません）。
実運用では、確認後に `kpi_records` へ upsert し、`activity_logs` に取り込み履歴を残します。
