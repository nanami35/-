import { Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStores } from "@/lib/data";
import { isAiLive } from "@/lib/ai/provider";
import { AI_TASKS } from "@/lib/ai/tasks";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AiTaskCard } from "@/components/ai/ai-task-card";

export default async function AiAssistantPage() {
  await requireUser();
  const stores = await getStores();
  const storeOptions = stores.map((s) => ({ id: s.id, name: s.name }));
  const live = isAiLive();

  return (
    <div className="space-y-6">
      <PageHeader
        title="AIアシスタント"
        description="ヒアリング要約から戦略・施策・レポートの下書きまで、AIが草案を作成します。"
      >
        <Badge tone={live ? "success" : "muted"}>
          {live ? "AI接続: 有効" : "モードモード: デモ（外部AI未接続）"}
        </Badge>
      </PageHeader>

      {/* 人間承認フローの説明 */}
      <Card>
        <CardContent className="flex items-start gap-3 pt-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-sm text-navy-700">
            <p className="font-medium">AI生成物は「下書き」です。必ず人が編集・承認します。</p>
            <p className="mt-1 text-muted-foreground">
              生成された内容はそのまま保存されません。担当者が数値・事実を確認し、編集のうえで各機能に反映してください。
              {live
                ? "（現在は外部AI（Claude）に接続しています）"
                : "（現在はデモのモック生成です。ANTHROPIC_API_KEY を設定すると Claude に接続されます）"}
            </p>
          </div>
        </CardContent>
      </Card>

      {storeOptions.length === 0 ? (
        <EmptyState description="対象となる店舗がありません。" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AI_TASKS.map((task) => (
            <AiTaskCard key={task.type} task={task} stores={storeOptions} />
          ))}
        </div>
      )}
    </div>
  );
}
