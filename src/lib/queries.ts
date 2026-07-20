import { db } from "@/lib/store";
import type { SafeUser } from "@/lib/types";
import { getData } from "@/lib/data";

// =====================================================================
// 読み取りヘルパー(Phase 1.1)
// 図鑑系の参照はデータプロバイダ(memory / supabase)へ委譲する。
// 可視性は memory では rbac、supabase では RLS が担保する。
// 個人/協働データ(お気に入り・コメント・通知・ユーザー名)は現状 store 参照
// (supabase モードでの移行は次段。既定の seed モードでは完全に整合)。
// =====================================================================

export const q = {
  companies: async (u: SafeUser) => (await getData()).listCompanies(u),
  getCompany: async (u: SafeUser, id: string) => (await getData()).getCompany(u, id),
  businessModels: async (u: SafeUser) => (await getData()).listBusinessModels(u),
  getBusinessModel: async (u: SafeUser, id: string) => (await getData()).getBusinessModel(u, id),
  knowledge: async (u: SafeUser) => (await getData()).listKnowledge(u),
  getKnowledge: async (u: SafeUser, id: string) => (await getData()).getKnowledge(u, id),
  cases: async (u: SafeUser) => (await getData()).listCases(u),
  getCase: async (u: SafeUser, id: string) => (await getData()).getCase(u, id),
  projects: async (u: SafeUser) => (await getData()).listProjects(u),
  getProject: async (u: SafeUser, id: string) => (await getData()).getProject(u, id),
  meetings: async (u: SafeUser) => (await getData()).listMeetings(u),
  getMeeting: async (u: SafeUser, id: string) => (await getData()).getMeeting(u, id),
  people: async (u: SafeUser) => (await getData()).listPeople(u),
  getPerson: async (u: SafeUser, id: string) => (await getData()).getPerson(u, id),
  sources: async (u: SafeUser) => (await getData()).listSources(u),
};

export function isFavorite(userId: string, entityType: string, entityId: string): boolean {
  return db.favorites.some(
    (f) => f.userId === userId && f.entityType === entityType && f.entityId === entityId,
  );
}

export function commentsFor(entityType: string, entityId: string) {
  return db.comments
    .filter((c) => c.entityType === entityType && c.entityId === entityId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function userName(userId: string): string {
  return db.users.find((u) => u.id === userId)?.name ?? "不明なユーザー";
}

const ENTITY_META: Record<string, { label: string; base: string; list: () => { id: string; name?: string; title?: string }[] }> = {
  company: { label: "企業", base: "/companies", list: () => db.companies },
  business_model: { label: "ビジネスモデル", base: "/business-models", list: () => db.businessModels },
  knowledge: { label: "ノウハウ", base: "/knowledge", list: () => db.knowledgeArticles },
  case: { label: "事例", base: "/cases", list: () => db.caseStudies },
  project: { label: "プロジェクト", base: "/projects", list: () => db.projects },
  meeting: { label: "会議記録", base: "/meetings", list: () => db.meetings },
  person: { label: "人物", base: "/people", list: () => db.people },
};

/** エンティティ参照をタイトル・リンクへ解決(お気に入り/履歴表示用) */
export function resolveEntity(
  entityType: string,
  entityId: string,
): { label: string; title: string; href: string } | null {
  const meta = ENTITY_META[entityType];
  if (!meta) return null;
  const item = meta.list().find((x) => x.id === entityId);
  if (!item) return null;
  return {
    label: meta.label,
    title: item.name ?? item.title ?? entityId,
    href: `${meta.base}/${entityId}`,
  };
}
