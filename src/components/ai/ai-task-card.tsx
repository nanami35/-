"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AiDraftButton } from "@/components/ai/ai-draft-button";
import type { AiTaskDef } from "@/lib/ai/types";

interface AiTaskCardProps {
  task: AiTaskDef;
  stores: { id: string; name: string }[];
}

export function AiTaskCard({ task, stores }: AiTaskCardProps) {
  const [storeId, setStoreId] = React.useState(stores[0]?.id ?? "");

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-gold-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-navy-800">{task.label}</h3>
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        {task.needsStore && (
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="h-9 flex-1 rounded-lg border border-input bg-white px-2 text-sm outline-none focus:border-navy-400"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        <AiDraftButton
          task={task.type}
          storeId={task.needsStore ? storeId : undefined}
          label="下書き生成"
          size="sm"
          freeInputLabel={task.freeInputLabel}
        />
      </div>
    </Card>
  );
}
