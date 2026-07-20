import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DataProvider } from "./provider";
import type {
  BusinessModel,
  CaseStudy,
  Company,
  KnowledgeArticle,
  Meeting,
  Person,
  Project,
  SafeUser,
  Source,
  BaseEntity,
} from "@/lib/types";
import { createUserClient } from "@/lib/supabase";

// =====================================================================
// Supabase 実装(DATA_SOURCE=supabase)
// 参照は RLS を効かせたユーザー文脈クライアントで行うため、可視性は DB(RLS)が
// 担保する(アプリ側の追加フィルタは不要)。行→ドメイン型のマッピングを行う。
// per-user RLS には Supabase Auth のアクセストークンが必要(Phase 1.1 タスク3)。
// トークン未指定時は publishable(anon)文脈となり、公開情報のみが見える。
// =====================================================================

export class SupabaseProvider implements DataProvider {
  readonly kind = "supabase" as const;
  private readonly client: SupabaseClient;

  constructor(accessToken?: string) {
    this.client = createUserClient(accessToken);
  }

  private async list<T>(table: string, map: (row: Row) => T): Promise<T[]> {
    const { data, error } = await this.client
      .from(table)
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`[supabase] ${table} の取得に失敗: ${error.message}`);
    return (data ?? []).map(map);
  }

  private async get<T>(table: string, id: string, map: (row: Row) => T): Promise<T | null> {
    const { data, error } = await this.client.from(table).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`[supabase] ${table}#${id} の取得に失敗: ${error.message}`);
    return data ? map(data as Row) : null;
  }

  listCompanies(_u: SafeUser) {
    return this.list("companies", mapCompany);
  }
  getCompany(_u: SafeUser, id: string) {
    return this.get("companies", id, mapCompany);
  }
  listBusinessModels(_u: SafeUser) {
    return this.list("business_models", mapBusinessModel);
  }
  getBusinessModel(_u: SafeUser, id: string) {
    return this.get("business_models", id, mapBusinessModel);
  }
  listKnowledge(_u: SafeUser) {
    return this.list("knowledge_articles", mapKnowledge);
  }
  getKnowledge(_u: SafeUser, id: string) {
    return this.get("knowledge_articles", id, mapKnowledge);
  }
  listCases(_u: SafeUser) {
    return this.list("case_studies", mapCase);
  }
  getCase(_u: SafeUser, id: string) {
    return this.get("case_studies", id, mapCase);
  }
  listProjects(_u: SafeUser) {
    return this.list("projects", mapProject);
  }
  getProject(_u: SafeUser, id: string) {
    return this.get("projects", id, mapProject);
  }
  listMeetings(_u: SafeUser) {
    return this.list("meetings", mapMeeting);
  }
  getMeeting(_u: SafeUser, id: string) {
    return this.get("meetings", id, mapMeeting);
  }
  listPeople(_u: SafeUser) {
    return this.list("people", mapPerson);
  }
  getPerson(_u: SafeUser, id: string) {
    return this.get("people", id, mapPerson);
  }
  listSources(_u: SafeUser) {
    return this.list("sources", mapSource);
  }
}

// --- 行→ドメイン型マッピング ----------------------------------------
type Row = Record<string, unknown>;

const s = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
const arr = (v: unknown): string[] | undefined => (Array.isArray(v) ? (v as string[]) : undefined);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

/** 共通カラム(BaseEntity)のマッピング */
function mapBase(r: Row): BaseEntity {
  return {
    id: String(r.id),
    organizationId: String(r.organization_id ?? ""),
    createdAt: s(r.created_at) ?? "",
    updatedAt: s(r.updated_at) ?? "",
    createdBy: s(r.created_by) ?? "",
    updatedBy: s(r.updated_by) ?? "",
    status: (s(r.status) ?? "draft") as BaseEntity["status"],
    visibility: (s(r.visibility) ?? "all_staff") as BaseEntity["visibility"],
    confidenceLevel: (s(r.confidence_level) ?? "C") as BaseEntity["confidenceLevel"],
    certaintyLevel: (s(r.certainty_level) ?? "needs_check") as BaseEntity["certaintyLevel"],
    deletedAt: s(r.deleted_at) ?? null,
    deletedBy: s(r.deleted_by) ?? null,
    sourceObtainedAt: s(r.source_obtained_at),
    lastVerifiedAt: s(r.last_verified_at),
    nextReviewAt: s(r.next_review_at),
  };
}

function mapCompany(r: Row): Company {
  return {
    ...mapBase(r),
    name: s(r.name) ?? "",
    nameKana: s(r.name_kana),
    nameEn: s(r.name_en),
    logoText: (s(r.name) ?? "").slice(0, 2),
    website: s(r.website),
    foundedYear: typeof r.founded_year === "number" ? r.founded_year : undefined,
    representative: s(r.representative),
    founder: s(r.founder),
    location: s(r.location),
    employees: s(r.employees),
    revenue: s(r.revenue),
    operatingProfit: s(r.operating_profit),
    listingStatus: s(r.listing_status),
    tickerCode: s(r.ticker_code),
    industry: s(r.industry),
    category: s(r.category) ?? "other",
    tags: arr(r.tags),
    businessModel: obj(r.business_model) as Company["businessModel"],
    analysis: obj(r.analysis) as Company["analysis"],
    application: obj(r.application) as Company["application"],
  };
}

function mapBusinessModel(r: Row): BusinessModel {
  const data = obj(r.data);
  return {
    ...mapBase(r),
    name: s(r.name) ?? "",
    definition: s(r.definition) ?? "",
    tags: arr(r.tags),
    ...(data as Partial<BusinessModel>),
  } as BusinessModel;
}

function mapKnowledge(r: Row): KnowledgeArticle {
  const data = obj(r.data);
  return {
    ...mapBase(r),
    title: s(r.title) ?? "",
    category: s(r.category) ?? "",
    tags: arr(r.tags),
    ...(data as Partial<KnowledgeArticle>),
  } as KnowledgeArticle;
}

function mapCase(r: Row): CaseStudy {
  const data = obj(r.data);
  return {
    ...mapBase(r),
    title: s(r.title) ?? "",
    kind: (s((data as Row).kind) ?? "success") as CaseStudy["kind"],
    tags: arr(r.tags),
    ...(data as Partial<CaseStudy>),
  } as CaseStudy;
}

function mapProject(r: Row): Project {
  const data = obj(r.data);
  return {
    ...mapBase(r),
    name: s(r.title) ?? s((data as Row).name) ?? "",
    tags: arr(r.tags),
    ...(data as Partial<Project>),
  } as Project;
}

function mapMeeting(r: Row): Meeting {
  const data = obj(r.data);
  return {
    ...mapBase(r),
    title: s(r.title) ?? "",
    tags: arr(r.tags),
    ...(data as Partial<Meeting>),
  } as Meeting;
}

function mapPerson(r: Row): Person {
  const data = obj(r.data);
  return {
    ...mapBase(r),
    name: s(r.title) ?? s((data as Row).name) ?? "",
    tags: arr(r.tags),
    ...(data as Partial<Person>),
  } as Person;
}

function mapSource(r: Row): Source {
  const data = obj(r.data);
  return {
    ...mapBase(r),
    name: s(r.title) ?? s((data as Row).name) ?? "",
    sourceType: s((data as Row).sourceType) ?? "",
    ...(data as Partial<Source>),
  } as Source;
}
