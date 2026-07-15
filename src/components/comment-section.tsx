import { commentsFor, userName } from "@/lib/queries";
import { CommentForm } from "@/components/interactive";
import { MessageSquare } from "lucide-react";

export function CommentSection({
  entityType,
  entityId,
  path,
}: {
  entityType: string;
  entityId: string;
  path: string;
}) {
  const comments = commentsFor(entityType, entityId);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-navy">
        <MessageSquare className="h-4 w-4" />
        社内議論・コメント({comments.length})
      </div>
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-muted">まだコメントはありません。最初のコメントを投稿しましょう。</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-navy-100/60 bg-canvas p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-navy">{userName(c.authorId)}</span>
              <span className="text-[11px] text-muted">{c.createdAt.slice(0, 10)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-ink">{c.body}</p>
          </div>
        ))}
      </div>
      <CommentForm entityType={entityType} entityId={entityId} path={path} />
    </div>
  );
}
