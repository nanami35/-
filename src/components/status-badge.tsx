import { Badge, type BadgeTone } from "@/components/ui/badge";
import {
  CONTRACT_STATUS, ISSUE_STATUS, INITIATIVE_STATUS, SOCIAL_STATUS,
  TASK_STATUS, PRIORITY, REPORT_STATUS,
  type ContractStatus, type IssueStatus, type InitiativeStatus,
  type SocialStatus, type TaskStatus, type Priority, type ReportStatus,
} from "@/lib/constants";

function make<T extends string>(
  map: Record<T, string>,
  tones: Partial<Record<T, BadgeTone>>,
  fallback: BadgeTone = "default"
) {
  return function StatusBadge({ value }: { value: T }) {
    return <Badge tone={tones[value] ?? fallback}>{map[value] ?? value}</Badge>;
  };
}

export const ContractStatusBadge = make<ContractStatus>(CONTRACT_STATUS, {
  prospect: "muted", negotiating: "info", active: "success", paused: "warning", ended: "muted",
});

export const IssueStatusBadge = make<IssueStatus>(ISSUE_STATUS, {
  open: "warning", in_progress: "info", resolved: "success", monitoring: "muted",
});

export const InitiativeStatusBadge = make<InitiativeStatus>(INITIATIVE_STATUS, {
  planned: "muted", in_progress: "info", completed: "success", paused: "warning", cancelled: "danger",
});

export const SocialStatusBadge = make<SocialStatus>(SOCIAL_STATUS, {
  idea: "muted", planning: "muted", shooting: "info", editing: "info",
  review: "warning", fixing: "warning", scheduled: "gold", posted: "success", analyzed: "navy",
});

export const TaskStatusBadge = make<TaskStatus>(TASK_STATUS, {
  todo: "muted", in_progress: "info", review: "warning", done: "success",
});

export const PriorityBadge = make<Priority>(PRIORITY, {
  low: "muted", medium: "info", high: "warning", urgent: "danger",
});

export const ReportStatusBadge = make<ReportStatus>(REPORT_STATUS, {
  draft: "muted", review: "warning", approved: "success", shared: "navy",
});
