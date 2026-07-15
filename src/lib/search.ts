import type { BaseEntity, ConfidenceLevel, CertaintyLevel, EntityType, SafeUser } from "@/lib/types";
import { db } from "@/lib/store";
import { filterViewable } from "@/lib/rbac";

// =====================================================================
// 横断検索インデックス(要件 8-3)+ RAG用リトリーバ(要件 8-4/15)
// 各エンティティを検索用ドキュメントへ平坦化する。
// 本番の pgvector セマンティック検索は同じ SearchDoc を対象に差し替え可能。
// =====================================================================

export interface SearchDoc {
  entityType: EntityType;
  id: string;
  title: string;
  subtitle?: string;
  text: string; // 全文検索対象
  href: string;
  confidenceLevel: ConfidenceLevel;
  certaintyLevel: CertaintyLevel;
  isInternal: boolean;
  organizationId: string;
  sourceObtainedAt?: string;
  lastVerifiedAt?: string;
  sourceUrl?: string;
  tags?: string[];
  category?: string;
}

function join(...parts: (string | undefined | string[] | number | null)[]): string {
  return parts
    .flat()
    .filter((p): p is string | number => p !== undefined && p !== null && p !== "")
    .join(" ");
}

/** 閲覧可能なエンティティのみを検索ドキュメント化する(RLS相当) */
export function buildDocs(user: SafeUser): SearchDoc[] {
  const docs: SearchDoc[] = [];
  const meta = (e: BaseEntity, isInternal: boolean) => ({
    confidenceLevel: e.confidenceLevel,
    certaintyLevel: e.certaintyLevel,
    isInternal,
    organizationId: e.organizationId,
    sourceObtainedAt: e.sourceObtainedAt,
    lastVerifiedAt: e.lastVerifiedAt,
  });

  for (const c of filterViewable(user, db.companies)) {
    const external = c.category !== "abengers" && c.category !== "marketing";
    docs.push({
      entityType: "company",
      id: c.id,
      title: c.name,
      subtitle: c.industry,
      href: `/companies/${c.id}`,
      text: join(
        c.name, c.nameKana, c.nameEn, c.industry, c.category,
        c.businessModel.valueProposition, c.businessModel.revenueModel, c.businessModel.competitiveEdge,
        c.analysis.successFactors, c.analysis.failureFactors, c.analysis.strengths, c.analysis.centerPin,
        c.application.abengersLearnings, c.application.avoidPoints, c.tags,
      ),
      tags: c.tags,
      category: c.category,
      ...meta(c, !external),
    });
  }

  for (const b of filterViewable(user, db.businessModels)) {
    docs.push({
      entityType: "business_model",
      id: b.id,
      title: b.name,
      subtitle: "ビジネスモデル",
      href: `/business-models/${b.id}`,
      text: join(b.name, b.definition, b.valueProposition, b.revenueSources, b.mainRisks, b.tags),
      tags: b.tags,
      ...meta(b, false),
    });
  }

  for (const k of filterViewable(user, db.knowledgeArticles)) {
    docs.push({
      entityType: "knowledge",
      id: k.id,
      title: k.title,
      subtitle: k.category,
      href: `/knowledge/${k.id}`,
      text: join(k.title, k.category, k.summary, k.conclusion, k.principles, k.practice, k.abengersUsage, k.koeniUsage, k.tags),
      tags: k.tags,
      category: k.category,
      ...meta(k, true),
    });
  }

  for (const cs of filterViewable(user, db.caseStudies)) {
    docs.push({
      entityType: "case",
      id: cs.id,
      title: cs.title,
      subtitle: cs.kind === "success" ? "成功事例" : "失敗事例",
      href: `/cases/${cs.id}`,
      text: join(cs.title, cs.companyName, cs.situation, cs.result, cs.successFactors, cs.failureFactors, cs.abengersImplication, cs.tags),
      tags: cs.tags,
      ...meta(cs, true),
    });
  }

  for (const p of filterViewable(user, db.projects)) {
    docs.push({
      entityType: "project",
      id: p.id,
      title: p.name,
      subtitle: "社内プロジェクト",
      href: `/projects/${p.id}`,
      text: join(p.name, p.clientName, p.industry, p.goal, p.background, p.supportContent, p.result, p.tags),
      tags: p.tags,
      ...meta(p, true),
    });
  }

  for (const m of filterViewable(user, db.meetings)) {
    docs.push({
      entityType: "meeting",
      id: m.id,
      title: m.title,
      subtitle: "会議記録",
      href: `/meetings/${m.id}`,
      text: join(m.title, m.agenda, m.minutes, m.aiSummary, m.tags),
      tags: m.tags,
      ...meta(m, true),
    });
  }

  for (const pe of filterViewable(user, db.people)) {
    docs.push({
      entityType: "person",
      id: pe.id,
      title: pe.name,
      subtitle: pe.title,
      href: `/people/${pe.id}`,
      text: join(pe.name, pe.companyName, pe.title, pe.philosophy, pe.strengths, pe.tags),
      tags: pe.tags,
      ...meta(pe, true),
    });
  }

  return docs;
}

/** 簡易全文スコアリング(キーワード一致数 + 更新日/信頼度で加点) */
export function scoreDoc(doc: SearchDoc, terms: string[]): number {
  if (terms.length === 0) return 0;
  const hay = (doc.title + " " + doc.text).toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (!t) continue;
    if (doc.title.toLowerCase().includes(t)) score += 5;
    // 出現回数
    const count = hay.split(t).length - 1;
    score += count;
  }
  // 信頼度で軽く加点(A>B>C)
  score += doc.confidenceLevel === "A" ? 1.5 : doc.confidenceLevel === "B" ? 0.8 : 0;
  return score;
}

export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[\s、。,.\/]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export interface SearchOptions {
  entityTypes?: EntityType[];
  category?: string;
  confidence?: ConfidenceLevel;
  limit?: number;
}

export function search(
  user: SafeUser,
  query: string,
  opts: SearchOptions = {},
): { doc: SearchDoc; score: number }[] {
  const terms = tokenize(query);
  let docs = buildDocs(user);
  if (opts.entityTypes?.length) docs = docs.filter((d) => opts.entityTypes!.includes(d.entityType));
  if (opts.category) docs = docs.filter((d) => d.category === opts.category);
  if (opts.confidence) docs = docs.filter((d) => d.confidenceLevel === opts.confidence);

  const scored = docs.map((doc) => ({ doc, score: scoreDoc(doc, terms) }));
  const filtered = terms.length ? scored.filter((s) => s.score > 0) : scored;
  filtered.sort((a, b) => b.score - a.score);
  return filtered.slice(0, opts.limit ?? 50);
}
