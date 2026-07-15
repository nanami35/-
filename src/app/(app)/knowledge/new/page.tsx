"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createKnowledgeAction } from "@/app/(app)/actions";
import { PageHeader } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { VISIBILITY_LABELS } from "@/lib/rbac";
import { AlertTriangle } from "lucide-react";

const CATEGORIES = [
  "経営戦略", "事業計画", "市場分析", "マーケティング", "SNS", "営業", "採用", "教育",
  "マネジメント", "組織構築", "FC本部構築", "加盟開発", "店舗開発", "財務", "PL管理",
  "資金調達", "DX", "AI", "M&A", "品質管理", "リスク管理",
];

export default function NewKnowledgePage() {
  const [state, formAction, pending] = useActionState(createKnowledgeAction, undefined);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="ノウハウを登録" description="登録直後は「下書き」です。実践方法はMarkdownで記述できます。" />
      <form action={formAction}>
        <Card>
          <CardBody className="space-y-4">
            <div>
              <Label>タイトル *</Label>
              <Input name="title" required placeholder="例:FC本部構築のセンターピンは加盟店の投資回収可能性" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>カテゴリ</Label>
                <Select name="category" defaultValue="経営戦略">
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>重要度</Label>
                <Select name="importance" defaultValue="medium">
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </Select>
              </div>
              <div>
                <Label>公開範囲</Label>
                <Select name="visibility" defaultValue="all_staff">
                  {Object.entries(VISIBILITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>要約</Label>
              <Textarea name="summary" rows={2} />
            </div>
            <div>
              <Label>結論</Label>
              <Textarea name="conclusion" rows={2} />
            </div>
            <div>
              <Label>実践方法(Markdown)</Label>
              <Textarea name="practice" rows={6} placeholder={"## 実践手順\n1. …\n2. …"} className="font-mono" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>ABENGERSでの活用方法</Label>
                <Textarea name="abengersUsage" rows={2} />
              </div>
              <div>
                <Label>コエニでの活用方法</Label>
                <Textarea name="koeniUsage" rows={2} />
              </div>
            </div>
            <div>
              <Label>タグ(カンマ区切り)</Label>
              <Input name="tags" />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger ring-1 ring-inset ring-red-200">
                <AlertTriangle className="h-4 w-4" />
                {state.error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/knowledge">
                <Button variant="secondary" type="button">
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" disabled={pending}>
                {pending ? "登録中…" : "下書きとして登録"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
