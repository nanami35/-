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
} from "@/lib/types";

// =====================================================================
// データアクセス層の抽象(Phase 1.1)
// DATA_SOURCE=seed  → MemoryProvider(インメモリ・既定・モックモード)
// DATA_SOURCE=supabase → SupabaseProvider(PostgreSQL + RLS)
// いずれも同一の非同期インターフェイスを実装し、呼び出し側は実装差を意識しない。
// 権限(可視性)は memory では rbac、supabase では RLS が担保する。
// =====================================================================

export interface DataProvider {
  readonly kind: "memory" | "supabase";

  listCompanies(user: SafeUser): Promise<Company[]>;
  getCompany(user: SafeUser, id: string): Promise<Company | null>;

  listBusinessModels(user: SafeUser): Promise<BusinessModel[]>;
  getBusinessModel(user: SafeUser, id: string): Promise<BusinessModel | null>;

  listKnowledge(user: SafeUser): Promise<KnowledgeArticle[]>;
  getKnowledge(user: SafeUser, id: string): Promise<KnowledgeArticle | null>;

  listCases(user: SafeUser): Promise<CaseStudy[]>;
  getCase(user: SafeUser, id: string): Promise<CaseStudy | null>;

  listProjects(user: SafeUser): Promise<Project[]>;
  getProject(user: SafeUser, id: string): Promise<Project | null>;

  listMeetings(user: SafeUser): Promise<Meeting[]>;
  getMeeting(user: SafeUser, id: string): Promise<Meeting | null>;

  listPeople(user: SafeUser): Promise<Person[]>;
  getPerson(user: SafeUser, id: string): Promise<Person | null>;

  listSources(user: SafeUser): Promise<Source[]>;
}
