"use client";

import { useState, useTransition } from "react";
import { Star, MessageSquarePlus, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import {
  addCommentAction,
  toggleFavoriteAction,
  transitionStatusAction,
} from "@/app/(app)/actions";
import type { Status } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/labels";

export function FavoriteButton({
  entityType,
  entityId,
  path,
  initial,
}: {
  entityType: string;
  entityId: string;
  path: string;
  initial: boolean;
}) {
  const [fav, setFav] = useState(initial);
  const [pending, start] = useTransition();
  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await toggleFavoriteAction(entityType, entityId, path);
          setFav((v) => !v);
          toast(fav ? "お気に入りを解除しました" : "お気に入りに追加しました");
        })
      }
    >
      <Star className={cn("h-4 w-4", fav && "fill-gold text-gold")} />
      {fav ? "お気に入り中" : "お気に入り"}
    </Button>
  );
}

const NEXT_STATES: Partial<Record<Status, { next: Status; label: string; variant: "primary" | "gold" | "danger" | "secondary" }[]>> =
  {
    draft: [{ next: "pending_review", label: "確認依頼する", variant: "gold" }],
    pending_review: [
      { next: "published", label: "承認して公開", variant: "primary" },
      { next: "revision_requested", label: "修正依頼", variant: "secondary" },
    ],
    revision_requested: [{ next: "pending_review", label: "再度確認依頼", variant: "gold" }],
    published: [{ next: "needs_recheck", label: "要再確認にする", variant: "secondary" }],
    needs_recheck: [{ next: "published", label: "確認済みにする", variant: "primary" }],
  };

export function StatusActions({
  entityType,
  entityId,
  status,
  path,
  canApprove,
  canEdit,
}: {
  entityType: string;
  entityId: string;
  status: Status;
  path: string;
  canApprove: boolean;
  canEdit: boolean;
}) {
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const actions = NEXT_STATES[status] ?? [];
  if (!canEdit || actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const needsApprover = ["published", "revision_requested"].includes(a.next);
        if (needsApprover && !canApprove) return null;
        return (
          <Button
            key={a.next}
            size="sm"
            variant={a.variant}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await transitionStatusAction(entityType, entityId, a.next, path);
                if (res?.error) toast(res.error, "error");
                else toast(`ステータスを「${STATUS_LABELS[a.next]}」に更新しました`);
              })
            }
          >
            {a.label}
          </Button>
        );
      })}
    </div>
  );
}

export function CommentForm({
  entityType,
  entityId,
  path,
}: {
  entityType: string;
  entityId: string;
  path: string;
}) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const { toast } = useToast();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        start(async () => {
          await addCommentAction(entityType, entityId, body, path);
          setBody("");
          toast("コメントを投稿しました");
        });
      }}
      className="space-y-2"
    >
      <Textarea
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="この情報をどう自社へ応用するか議論しましょう…"
      />
      <div className="flex justify-end">
        <Button size="sm" type="submit" disabled={pending || !body.trim()}>
          <Send className="h-3.5 w-3.5" />
          投稿
        </Button>
      </div>
    </form>
  );
}

export { MessageSquarePlus, CheckCircle2 };
