/**
 * 実行環境の設定判定。
 *
 * データソースと認証方式は環境変数の有無で自動的に切り替わる。
 *   - DATABASE_URL あり            → Supabase/PostgreSQL(Prisma) を使用
 *   - DATABASE_URL なし            → インメモリのサンプルデータ（デモ）
 *   - NEXT_PUBLIC_SUPABASE_URL あり → Supabase Auth を使用
 *   - なし                         → デモ用の簡易ログイン
 *
 * これにより、Supabase 未設定でもアプリはそのまま動作し（デモ）、
 * 環境変数を設定するだけで本番バックエンドへ切り替わる。
 */

/** Supabase/PostgreSQL(Prisma) をデータソースとして使用するか */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0);
}

/** Supabase Auth を認証に使用するか */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** ファイルアップロードの上限（MB） */
export const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB ?? "10");
