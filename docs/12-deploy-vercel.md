# Vercel でデモ公開（公開URLの取得）

このアプリは **Supabase もキーも無し**でそのまま動くため、Vercel にそのままデプロイして
公開URL（`https://xxx.vercel.app`）でデモを共有できます（デモ/モックモード）。

## 方法A：GitHub 連携でデプロイ（推奨）

1. [vercel.com](https://vercel.com/) に **GitHub でサインイン**。
2. **Add New… → Project → Import Git Repository** で対象リポジトリを選択。
   - 出てこない場合は「Adjust GitHub App Permissions」で当該リポジトリへのアクセスを許可。
3. **Configure Project**：
   - Framework Preset: **Next.js**（自動検出）
   - Root Directory: リポジトリ直下のまま
   - Environment Variables: **設定不要**（デモはモードで動作）
   - **Deploy** をクリック。
4. デモ（このブランチ）を公開URLにする：
   - **Project → Settings → Git → Production Branch** を
     `claude/restaurant-marketing-os-ih4jau` に変更して Save。
   - **Deployments → Redeploy** → 数分で `https://<project>.vercel.app` が発行されます。
   - ※ ブランチを push するたびに Preview URL も自動発行されます。

## 方法B：Vercel CLI

```bash
npm i -g vercel
git checkout claude/restaurant-marketing-os-ih4jau
npm install
vercel          # プロジェクト作成（プロンプトに従う。env 不要）
vercel --prod   # 公開URLが表示される
```

## ログイン（公開URLで）

デモアカウントを選ぶだけでログインできます（メール/パスワード不要）。

| アカウント | ロール |
| --- | --- |
| 山田 太郎 | 管理者 |
| 佐藤 花子 | マーケティング担当者 |
| 田中 誠 | クライアント（自店舗ポータル） |

## 本番接続に切り替える場合（任意）

Vercel の **Project → Settings → Environment Variables** に追加すると、デモから実接続へ切り替わります。

- Supabase: `DATABASE_URL` / `DIRECT_URL` / `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- AI: `ANTHROPIC_API_KEY`（任意で `AI_MODEL`）
- 外部連携: 各媒体トークン（`GOOGLE_BUSINESS_ACCESS_TOKEN` 等）

詳細は `docs/09-supabase-setup.md` / `docs/10-ai-features.md` / `docs/11-integrations.md`。

## 補足

- デモはインメモリのサンプルデータで動作し、**入力・承認は永続化されません**（読み取り中心の体験）。
- ビルドは `prisma generate && next build`。Prisma Client はスキーマから生成され、
  `DATABASE_URL` 未設定時は接続しません（モック動作）。
