"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCompanyAction } from "@/app/(app)/actions";
import { PageHeader } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { CATEGORY_LABELS } from "@/lib/labels";
import { VISIBILITY_LABELS } from "@/lib/rbac";
import { AlertTriangle } from "lucide-react";

export default function NewCompanyPage() {
  const [state, formAction, pending] = useActionState(createCompanyAction, undefined);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="企業を登録" description="登録直後は「下書き」となり、承認後に公開されます(要件8-14)。" />
      <form action={formAction}>
        <Card>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>企業名 *</Label>
                <Input name="name" required placeholder="例:船井総合研究所" />
              </div>
              <div>
                <Label>企業名(カナ)</Label>
                <Input name="nameKana" />
              </div>
              <div>
                <Label>業界</Label>
                <Input name="industry" placeholder="経営コンサルティング" />
              </div>
              <div>
                <Label>企業カテゴリ</Label>
                <Select name="category" defaultValue="consulting">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>公式URL</Label>
                <Input name="website" type="url" placeholder="https://" />
              </div>
              <div>
                <Label>代表者</Label>
                <Input name="representative" />
              </div>
              <div>
                <Label>所在地</Label>
                <Input name="location" />
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
              <Label>提供価値</Label>
              <Textarea name="valueProposition" rows={2} />
            </div>
            <div>
              <Label>収益モデル</Label>
              <Textarea name="revenueModel" rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>強み(改行またはカンマ区切り)</Label>
                <Textarea name="strengths" rows={3} />
              </div>
              <div>
                <Label>ABENGERSが学ぶべき点(改行区切り)</Label>
                <Textarea name="abengersLearnings" rows={3} />
              </div>
            </div>
            <div>
              <Label>タグ(カンマ区切り)</Label>
              <Input name="tags" placeholder="コンサル, ベンチマーク" />
            </div>

            <input type="hidden" name="status" value="draft" />

            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger ring-1 ring-inset ring-red-200">
                <AlertTriangle className="h-4 w-4" />
                {state.error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/companies">
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
