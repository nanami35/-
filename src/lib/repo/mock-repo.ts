/**
 * モック実装（インメモリのサンプルデータ）。
 * Supabase 未設定時（デモ）に使用する。
 */
import * as db from "@/lib/sample-data";
import type { Repository } from "@/lib/repo/repository";

const notDeleted = <T extends { deletedAt?: string | null }>(rows: T[]): T[] =>
  rows.filter((r) => !r.deletedAt);

export const mockRepo: Repository = {
  getOrganizations: async () => db.organizations,
  getUsers: async () => notDeleted(db.users),
  getClients: async () => notDeleted(db.clients),
  getStores: async () => notDeleted(db.stores),
  getHearings: async () => notDeleted(db.hearings),
  getDiagnoses: async () => notDeleted(db.diagnoses),
  getCompetitors: async () => notDeleted(db.competitors),
  getMarketAnalyses: async () => notDeleted(db.marketAnalyses),
  getIssues: async () => notDeleted(db.issues),
  getStrategies: async () => notDeleted(db.strategies),
  getKpiRecords: async () => notDeleted(db.kpiRecords),
  getInitiatives: async () => notDeleted(db.initiatives),
  getSocialContents: async () => notDeleted(db.socialContents),
  getTasks: async () => notDeleted(db.tasks),
  getMeetings: async () =>
    notDeleted(db.meetings).sort((a, b) => b.datetime.localeCompare(a.datetime)),
  getMonthlyReports: async () => notDeleted(db.monthlyReports),
  getKnowledgeCases: async () => notDeleted(db.knowledgeCases),
};
