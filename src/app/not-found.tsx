import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center">
      <div className="text-5xl font-bold text-navy-100">404</div>
      <h1 className="mt-3 text-lg font-semibold text-navy">情報が見つかりません</h1>
      <p className="mt-1 text-sm text-muted">
        削除されたか、閲覧権限がない可能性があります。
      </p>
      <Link
        href="/dashboard"
        className="mt-5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-600"
      >
        ダッシュボードへ戻る
      </Link>
    </div>
  );
}
