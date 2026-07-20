"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** レポートを印刷するボタン（クライアント側で window.print を呼ぶ） */
export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      印刷
    </Button>
  );
}
