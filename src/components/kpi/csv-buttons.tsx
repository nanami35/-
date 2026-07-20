"use client";

import * as React from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseCsv } from "@/lib/csv";

interface KpiCsvButtonsProps {
  /** サーバー側で toCsv により生成済みの CSV 文字列 */
  csv: string;
  /** ファイル名などに使う店舗名 */
  storeName: string;
}

/** KPI の CSV エクスポート／インポート（プレビューのみ・保存なし） */
export function KpiCsvButtons({ csv, storeName }: KpiCsvButtonsProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  function handleExport() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kpi_${storeName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    // 先頭行はヘッダー想定
    const dataRows = Math.max(0, rows.length - 1);
    setPreview(`「${file.name}」を読み込みました：${dataRows}件（プレビューのみ・保存されません）`);
    // 同じファイルを再選択できるようリセット
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          CSVエクスポート
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          CSVインポート
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImport}
        />
      </div>
      {preview && <p className="text-xs text-muted-foreground">{preview}</p>}
    </div>
  );
}
