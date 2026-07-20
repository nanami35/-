import type { DataProvider } from "./provider";
import type { BaseEntity, SafeUser } from "@/lib/types";
import { db } from "@/lib/store";
import { canView, filterViewable } from "@/lib/rbac";

// インメモリ実装(既定 / モックモード)。既存の store + rbac をそのまま利用する。
export class MemoryProvider implements DataProvider {
  readonly kind = "memory" as const;

  private one<T extends BaseEntity>(user: SafeUser, list: T[], id: string): T | null {
    const item = list.find((x) => x.id === id);
    if (!item) return null;
    return canView(user, item) ? item : null;
  }

  async listCompanies(user: SafeUser) {
    return filterViewable(user, db.companies);
  }
  async getCompany(user: SafeUser, id: string) {
    return this.one(user, db.companies, id);
  }

  async listBusinessModels(user: SafeUser) {
    return filterViewable(user, db.businessModels);
  }
  async getBusinessModel(user: SafeUser, id: string) {
    return this.one(user, db.businessModels, id);
  }

  async listKnowledge(user: SafeUser) {
    return filterViewable(user, db.knowledgeArticles);
  }
  async getKnowledge(user: SafeUser, id: string) {
    return this.one(user, db.knowledgeArticles, id);
  }

  async listCases(user: SafeUser) {
    return filterViewable(user, db.caseStudies);
  }
  async getCase(user: SafeUser, id: string) {
    return this.one(user, db.caseStudies, id);
  }

  async listProjects(user: SafeUser) {
    return filterViewable(user, db.projects);
  }
  async getProject(user: SafeUser, id: string) {
    return this.one(user, db.projects, id);
  }

  async listMeetings(user: SafeUser) {
    return filterViewable(user, db.meetings);
  }
  async getMeeting(user: SafeUser, id: string) {
    return this.one(user, db.meetings, id);
  }

  async listPeople(user: SafeUser) {
    return filterViewable(user, db.people);
  }
  async getPerson(user: SafeUser, id: string) {
    return this.one(user, db.people, id);
  }

  async listSources(user: SafeUser) {
    return filterViewable(user, db.sources);
  }
}
