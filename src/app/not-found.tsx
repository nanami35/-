import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <p className="text-5xl font-bold text-navy-200">404</p>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-navy-800">ページが見つかりません</h2>
        <p className="text-sm text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
      </div>
      <Link href="/dashboard">
        <Button>ダッシュボードへ戻る</Button>
      </Link>
    </div>
  );
}
