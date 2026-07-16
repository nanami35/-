import { requireClientScope } from "@/lib/portal";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText } from "lucide-react";

// デモ用の資料一覧（プレースホルダ）
const SAMPLE_FILES = [
  { name: "店舗メニュー_2026春.pdf", size: "1.2MB", date: "2026-04-02" },
  { name: "店内写真_一式.zip", size: "18.4MB", date: "2026-03-15" },
  { name: "販促カレンダー.xlsx", size: "48KB", date: "2026-05-01" },
];

export default async function PortalUploadsPage() {
  await requireClientScope();

  return (
    <div className="space-y-6">
      <PageHeader title="資料" description="施策に必要な資料をアップロード・共有できます。" />

      <Card>
        <CardHeader>
          <CardTitle>資料をアップロード</CardTitle>
          <CardDescription>メニュー表・店舗写真・販促物などをアップロードすると担当者と共有されます。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 text-navy-500">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-navy-700">ファイルをドラッグ＆ドロップ</p>
              <p className="text-sm text-muted-foreground">または下のボタンから選択（PDF / 画像 / Excel、最大10MB）</p>
            </div>
            <Button variant="outline">ファイルを選択</Button>
            <p className="text-xs text-muted-foreground">※ 本デモではアップロードは保存されません。</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>共有済みの資料</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SAMPLE_FILES.map((f) => (
            <div key={f.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy-800">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.size}・{f.date}</p>
              </div>
              <Badge tone="muted">共有済み</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
