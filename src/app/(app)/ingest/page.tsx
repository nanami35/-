"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { extractAction, saveExtractionAction, type Extraction } from "./actions";
import { PageHeader } from "@/components/ui/page";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Upload, Link2, FileText, CheckCircle2 } from "lucide-react";

const KINDS = [
  { key: "text", label: "テキスト", icon: FileText },
  { key: "url", label: "URL", icon: Link2 },
  { key: "file", label: "資料(PDF/Word/Excel等)", icon: Upload },
];

export default function IngestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [kind, setKind] = useState("text");
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<Extraction | null>(null);
  const [pending, start] = useTransition();
  const [saving, startSave] = useTransition();

  const runExtract = () => {
    start(async () => {
      const payload = kind === "file" ? `${fileName}\n(ファイル内容のテキスト抽出結果を想定)` : input;
      const res = await extractAction(payload, kind);
      if ("error" in res) {
        toast(res.error, "error");
        return;
      }
      setResult(res);
      toast("AIが情報を抽出しました。内容を確認して登録してください。");
    });
  };

  const save = (formData: FormData) => {
    startSave(async () => {
      const res = await saveExtractionAction(undefined, formData);
      if (res && "error" in res && res.error) {
        toast(res.error, "error");
        return;
      }
      toast("承認待ちとして登録しました(要件8-14)");
      router.push("/approvals");
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="情報登録・取り込み"
        description="テキスト・URL・資料を取り込み、AIが要約・分類・エンティティ抽出します。抽出結果は人間が確認・修正してから登録します。"
      />

      <Card className="mb-4">
        <CardHeader title="1. 取り込む情報" />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => {
              const Icon = k.icon;
              return (
                <button key={k.key} onClick={() => setKind(k.key)}>
                  <Badge tone={kind === k.key ? "navy" : "gray"}>
                    <Icon className="h-3 w-3" /> {k.label}
                  </Badge>
                </button>
              );
            })}
          </div>

          {kind === "url" ? (
            <div>
              <Label>URL</Label>
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://example.com/article" />
            </div>
          ) : kind === "file" ? (
            <div>
              <Label>ファイル(PDF / Word / Excel / PowerPoint / CSV / 画像)</Label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.png,.jpg,.jpeg,.txt"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-sm file:text-white"
              />
              {fileName && <p className="mt-1 text-xs text-muted">選択中: {fileName}</p>}
              <p className="mt-1 text-[11px] text-muted">
                ※ MVPではファイルのテキスト抽出はモックです。本番はSupabase Storage + 抽出処理に接続します。
              </p>
            </div>
          ) : (
            <div>
              <Label>本文(会議議事録・文字起こし・コピー&ペースト等)</Label>
              <Textarea rows={6} value={input} onChange={(e) => setInput(e.target.value)} placeholder="取り込みたいテキストを貼り付けてください…" />
            </div>
          )}

          <Button onClick={runExtract} disabled={pending}>
            <Sparkles className="h-4 w-4" />
            {pending ? "AI抽出中…" : "AIで抽出する"}
          </Button>
        </CardBody>
      </Card>

      {result && (
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-gold" /> 2. AI抽出結果の確認・修正
              </span>
            }
            subtitle="内容を確認・修正のうえ、承認待ちとして登録します。"
          />
          <CardBody>
            <form action={save} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>タイトル</Label>
                  <Input name="title" defaultValue={result.title} />
                </div>
                <div className="sm:col-span-2">
                  <Label>要約</Label>
                  <Textarea name="summary" rows={2} defaultValue={result.summary} />
                </div>
                <div>
                  <Label>カテゴリ</Label>
                  <Input name="category" defaultValue={result.category} />
                </div>
                <div>
                  <Label>信頼度候補</Label>
                  <Select name="confidenceCandidate" defaultValue={result.confidenceCandidate}>
                    <option value="A">A:一次情報</option>
                    <option value="B">B:高信頼の二次情報</option>
                    <option value="C">C:参考・仮説</option>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>重要ポイント</Label>
                  <Textarea name="keyPoints" rows={3} defaultValue={result.keyPoints.map((k) => `- ${k}`).join("\n")} />
                </div>
                <div>
                  <Label>ABENGERSへの応用</Label>
                  <Textarea name="abengersApplication" rows={2} defaultValue={result.abengersApplication} />
                </div>
                <div>
                  <Label>コエニへの応用</Label>
                  <Textarea name="koeniApplication" rows={2} defaultValue={result.koeniApplication} />
                </div>
                <div className="sm:col-span-2">
                  <Label>タグ(カンマ区切り)</Label>
                  <Input name="tags" defaultValue={result.tags.join(", ")} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 rounded-lg bg-canvas p-3 text-xs text-muted">
                <span className="font-medium text-navy">抽出メタ:</span>
                {result.companies.length > 0 && <Badge tone="navy">企業: {result.companies.join("、")}</Badge>}
                {result.industry !== "—" && <Badge>業界: {result.industry}</Badge>}
                {result.failureFactors.length > 0 && <Badge tone="red">失敗要因あり</Badge>}
                {result.risks.length > 0 && <Badge tone="gold">リスク検出</Badge>}
                <Badge tone="gray">{result.isMock ? "モック抽出" : "実AI抽出"}</Badge>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <CheckCircle2 className="h-4 w-4" />
                  {saving ? "登録中…" : "確認して承認待ちに登録"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
