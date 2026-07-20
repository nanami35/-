import { Badge } from "@/components/ui/badge";
import {
  CERTAINTY_LABELS,
  CERTAINTY_TONE,
  CONFIDENCE_LABELS,
  CONFIDENCE_TONE,
  STATUS_LABELS,
  STATUS_TONE,
} from "@/lib/labels";
import type { BaseEntity, CertaintyLevel, ConfidenceLevel, Status } from "@/lib/types";
import { ShieldCheck, FlaskConical } from "lucide-react";

export function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return (
    <Badge tone={CONFIDENCE_TONE[level]}>
      <ShieldCheck className="h-3 w-3" />
      {CONFIDENCE_LABELS[level]}
    </Badge>
  );
}

export function CertaintyBadge({ level }: { level: CertaintyLevel }) {
  return (
    <Badge tone={CERTAINTY_TONE[level]}>
      <FlaskConical className="h-3 w-3" />
      {CERTAINTY_LABELS[level]}
    </Badge>
  );
}

/** 一覧・詳細で信頼度と確定度が一目で分かる複合バッジ(要件9) */
export function TrustBadges({ e }: { e: Pick<BaseEntity, "confidenceLevel" | "certaintyLevel" | "status"> }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ConfidenceBadge level={e.confidenceLevel} />
      <CertaintyBadge level={e.certaintyLevel} />
      <StatusBadge status={e.status} />
    </div>
  );
}
