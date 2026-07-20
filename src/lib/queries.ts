import type { BaseEntity, SafeUser } from "@/lib/types";
import { db } from "@/lib/store";
import { canView, filterViewable } from "@/lib/rbac";

// 可視性を適用した読み取りヘルパー(RLS相当をアプリ層で保証)
export const q = {
  companies: (u: SafeUser) => filterViewable(u, db.companies),
  businessModels: (u: SafeUser) => filterViewable(u, db.businessModels),
  knowledge: (u: SafeUser) => filterViewable(u, db.knowledgeArticles),
  cases: (u: SafeUser) => filterViewable(u, db.caseStudies),
  projects: (u: SafeUser) => filterViewable(u, db.projects),
  meetings: (u: SafeUser) => filterViewable(u, db.meetings),
  sources: (u: SafeUser) => filterViewable(u, db.sources),
  people: (u: SafeUser) => filterViewable(u, db.people),
};

/** 1件取得(閲覧不可なら null) */
export function getOne<T extends BaseEntity>(u: SafeUser, list: T[], id: string): T | null {
  const item = list.find((x) => x.id === id);
  if (!item) return null;
  return canView(u, item) ? item : null;
}

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
