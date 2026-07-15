import type {
  AuditLog,
  BusinessModel,
  CaseStudy,
  Comment,
  Company,
  ComparisonMatrix,
  Favorite,
  KnowledgeArticle,
  Meeting,
  Notification,
  Organization,
  Person,
  Project,
  ReadingHistory,
  Source,
  User,
} from "@/lib/types";
import * as seed from "@/lib/seed";

// =====================================================================
// データストア(要件13/14)
// DATA_SOURCE=seed のときはインメモリで動作(外部DB不要で即起動)。
// DATA_SOURCE=supabase のときは同じインターフェイスを Supabase 実装へ
// 差し替え可能な構造(本番)。MVPではインメモリ実装を提供する。
// dev の HMR でも状態を保つため globalThis に保持する。
// =====================================================================

export interface DB {
  organizations: Organization[];
  users: User[];
  companies: Company[];
  businessModels: BusinessModel[];
  comparisonMatrices: ComparisonMatrix[];
  knowledgeArticles: KnowledgeArticle[];
  caseStudies: CaseStudy[];
  projects: Project[];
  meetings: Meeting[];
  sources: Source[];
  people: Person[];
  notifications: Notification[];
  favorites: Favorite[];
  readingHistories: ReadingHistory[];
  comments: Comment[];
  auditLogs: AuditLog[];
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function build(): DB {
  return {
    organizations: clone(seed.organizations),
    users: clone(seed.users),
    companies: clone(seed.companies),
    businessModels: clone(seed.businessModels),
    comparisonMatrices: clone(seed.comparisonMatrices),
    knowledgeArticles: clone(seed.knowledgeArticles),
    caseStudies: clone(seed.caseStudies),
    projects: clone(seed.projects),
    meetings: clone(seed.meetings),
    sources: clone(seed.sources),
    people: clone(seed.people),
    notifications: clone(seed.notifications),
    favorites: clone(seed.favorites),
    readingHistories: clone(seed.readingHistories),
    comments: clone(seed.comments),
    auditLogs: clone(seed.auditLogs),
  };
}

const g = globalThis as unknown as { __ABENGERS_DB__?: DB };
export const db: DB = g.__ABENGERS_DB__ ?? (g.__ABENGERS_DB__ = build());

// --- 監査ログ(要件18) ---------------------------------------------
let auditSeq = 1000;
export function audit(
  organizationId: string,
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  detail?: string,
): void {
  db.auditLogs.unshift({
    id: `aud-${auditSeq++}`,
    organizationId,
    userId,
    action,
    entityType,
    entityId,
    detail,
    createdAt: nowIso(),
  });
}

let idSeq = 1000;
export function newId(prefix: string): string {
  return `${prefix}-${idSeq++}`;
}

// Date.now が使えない環境のためのフォールバック含む安全な現在時刻。
export function nowIso(): string {
  try {
    return new Date().toISOString();
  } catch {
    return "2026-07-15T00:00:00.000Z";
  }
}
