"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-danger">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-navy-800">エラーが発生しました</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          データの読み込み中に問題が発生しました。時間をおいて再度お試しください。
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">エラーID: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset}>再読み込み</Button>
    </div>
  );
}
