import type {
  BaseEntity,
  CertaintyLevel,
  ConfidenceLevel,
  Status,
  Visibility,
} from "@/lib/types";

export const ABENGERS_ORG = "org-abengers";
export const KOENI_ORG = "org-koeni";
export const SEED_GROUP_ORG = "org-seed-group";

const NOW = "2026-07-01T09:00:00.000Z";

/**
 * BaseEntity の共通カラムを埋めるヘルパー。
 * シードデータの記述量を抑えつつ、要件14の必須カラムを保証する。
 */
export function base(
  overrides: Partial<BaseEntity> & {
    id: string;
    organizationId?: string;
    status?: Status;
    visibility?: Visibility;
    confidenceLevel?: ConfidenceLevel;
    certaintyLevel?: CertaintyLevel;
  },
): BaseEntity {
  return {
    id: overrides.id,
    organizationId: overrides.organizationId ?? ABENGERS_ORG,
    createdAt: overrides.createdAt ?? NOW,
    updatedAt: overrides.updatedAt ?? NOW,
    createdBy: overrides.createdBy ?? "user-hori",
    updatedBy: overrides.updatedBy ?? "user-hori",
    status: overrides.status ?? "published",
    visibility: overrides.visibility ?? "all_staff",
    confidenceLevel: overrides.confidenceLevel ?? "B",
    certaintyLevel: overrides.certaintyLevel ?? "strong",
    deletedAt: overrides.deletedAt ?? null,
    deletedBy: overrides.deletedBy ?? null,
    sourceObtainedAt: overrides.sourceObtainedAt ?? "2026-06-01",
    lastVerifiedAt: overrides.lastVerifiedAt ?? "2026-06-20",
    nextReviewAt: overrides.nextReviewAt ?? "2026-09-20",
  };
}
