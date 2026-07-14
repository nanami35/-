/**
 * データアクセス層。
 * 現在はサンプルデータ（インメモリ）を返す。
 * 本番では、この関数群の内部を Prisma/Supabase クエリに差し替えることで
 * UI 側を変更せずに移行できる。
 *
 * 全クエリは organizationId でスコープする前提（マルチテナント）。
 * MVP デモでは単一組織のみを扱う。
 */
import * as db from "@/lib/sample-data";
import { computeDiagnosis } from "@/lib/scoring";
import { isOverdue, achievementRate } from "@/lib/utils";
import type {
  Client, Store, User, Hearing, Diagnosis, Competitor, Issue,
  Strategy, KpiRecord, Initiative, SocialContent, Task, Meeting,
  MonthlyReport, KnowledgeCase, MarketAnalysis,
} from "@/types";

const notDeleted = <T extends { deletedAt?: string | null }>(rows: T[]) =>
  rows.filter((r) => !r.deletedAt);

/* ---------------- Users ---------------- */
export const getUsers = (): User[] => notDeleted(db.users);
export const getUser = (id?: string): User | undefined =>
  db.users.find((u) => u.id === id);
export const getUserName = (id?: string): string =>
  getUser(id)?.name ?? "未割当";

/* ---------------- Clients ---------------- */
export const getClients = (): Client[] => notDeleted(db.clients);
export const getClient = (id: string): Client | undefined =>
  getClients().find((c) => c.id === id);

/* ---------------- Stores ---------------- */
export const getStores = (): Store[] => notDeleted(db.stores);
export const getStore = (id: string): Store | undefined =>
  getStores().find((s) => s.id === id);
export const getStoresByClient = (clientId: string): Store[] =>
  getStores().filter((s) => s.clientId === clientId);

/* ---------------- Hearings ---------------- */
export const getHearings = (): Hearing[] => notDeleted(db.hearings);
export const getHearingByStore = (storeId: string): Hearing | undefined =>
  getHearings().find((h) => h.storeId === storeId);

/* ---------------- Diagnoses ---------------- */
export const getDiagnoses = (): Diagnosis[] => notDeleted(db.diagnoses);
export const getDiagnosesByStore = (storeId: string): Diagnosis[] =>
  getDiagnoses()
    .filter((d) => d.storeId === storeId)
    .sort((a, b) => b.date.localeCompare(a.date));
export const getDiagnosis = (id: string): Diagnosis | undefined =>
  getDiagnoses().find((d) => d.id === id);
export const getLatestDiagnosis = (storeId: string): Diagnosis | undefined =>
  getDiagnosesByStore(storeId)[0];

/* ---------------- Competitors / Market ---------------- */
export const getCompetitorsByStore = (storeId: string): Competitor[] =>
  notDeleted(db.competitors).filter((c) => c.storeId === storeId);
export const getMarketByStore = (storeId: string): MarketAnalysis | undefined =>
  notDeleted(db.marketAnalyses).find((m) => m.storeId === storeId);

/* ---------------- Issues ---------------- */
export const getIssues = (): Issue[] => notDeleted(db.issues);
export const getIssuesByStore = (storeId: string): Issue[] =>
  getIssues().filter((i) => i.storeId === storeId);
export const getIssue = (id: string): Issue | undefined =>
  getIssues().find((i) => i.id === id);
/** 優先度スコア = 影響度 × 緊急度 ×(4 - 難易度) */
export const priorityScore = (i: Issue): number =>
  i.impact * i.urgency * (4 - i.difficulty);

/* ---------------- Strategies ---------------- */
export const getStrategyByStore = (storeId: string): Strategy | undefined =>
  notDeleted(db.strategies).find((s) => s.storeId === storeId);

/* ---------------- KPI ---------------- */
export const getKpiRecords = (): KpiRecord[] => notDeleted(db.kpiRecords);
export const getKpiByStore = (storeId: string): KpiRecord[] =>
  getKpiRecords().filter((k) => k.storeId === storeId);
export const getKpiSeries = (storeId: string, kpiKey: string): KpiRecord[] =>
  getKpiByStore(storeId)
    .filter((k) => k.kpiKey === kpiKey)
    .sort((a, b) => a.month.localeCompare(b.month));
export const getKpiMonths = (storeId: string): string[] =>
  Array.from(new Set(getKpiByStore(storeId).map((k) => k.month))).sort();

/* ---------------- Initiatives ---------------- */
export const getInitiatives = (): Initiative[] => notDeleted(db.initiatives);
export const getInitiativesByStore = (storeId: string): Initiative[] =>
  getInitiatives().filter((i) => i.storeId === storeId);
export const getInitiative = (id: string): Initiative | undefined =>
  getInitiatives().find((i) => i.id === id);

/* ---------------- Social ---------------- */
export const getSocialContents = (): SocialContent[] =>
  notDeleted(db.socialContents);
export const getSocialByStore = (storeId: string): SocialContent[] =>
  getSocialContents().filter((s) => s.storeId === storeId);

/* ---------------- Tasks ---------------- */
export const getTasks = (): Task[] => notDeleted(db.tasks);
export const getTask = (id: string): Task | undefined =>
  getTasks().find((t) => t.id === id);
export const getTasksByStore = (storeId: string): Task[] =>
  getTasks().filter((t) => t.storeId === storeId);

/* ---------------- Meetings ---------------- */
export const getMeetings = (): Meeting[] =>
  notDeleted(db.meetings).sort((a, b) => b.datetime.localeCompare(a.datetime));

/* ---------------- Reports ---------------- */
export const getReports = (): MonthlyReport[] => notDeleted(db.monthlyReports);
export const getReport = (id: string): MonthlyReport | undefined =>
  getReports().find((r) => r.id === id);
export const getReportsByStore = (storeId: string): MonthlyReport[] =>
  getReports()
    .filter((r) => r.storeId === storeId)
    .sort((a, b) => b.month.localeCompare(a.month));

/* ---------------- Knowledge ---------------- */
export const getKnowledgeCases = (): KnowledgeCase[] =>
  notDeleted(db.knowledgeCases);

/* ============================================================
 * ダッシュボード用の集計
 * ========================================================== */
export interface DashboardMetrics {
  activeClients: number;
  activeStores: number;
  monthlySalesImprovement: number;
  taskCompletionRate: number;
  overdueTasks: number;
  nextMeeting?: { store: string; date: string };
  recentlyUpdated: { store: Store; client?: Client }[];
  kpiMissingStores: Store[];
  attentionStores: { store: Store; reason: string }[];
  storeRanking: { store: Store; improvement: number; achievement: number }[];
  consultantLoad: { user: User; storeCount: number; openTasks: number }[];
}

export function getDashboardMetrics(filter?: {
  clientId?: string;
  storeId?: string;
  consultantId?: string;
}): DashboardMetrics {
  let stores = getStores();
  if (filter?.clientId) stores = stores.filter((s) => s.clientId === filter.clientId);
  if (filter?.storeId) stores = stores.filter((s) => s.id === filter.storeId);
  if (filter?.consultantId)
    stores = stores.filter((s) => s.consultantId === filter.consultantId);

  const storeIds = new Set(stores.map((s) => s.id));
  const clients = getClients().filter(
    (c) => c.contractStatus === "active" && stores.some((s) => s.clientId === c.id)
  );

  const tasks = getTasks().filter((t) => !t.storeId || storeIds.has(t.storeId));
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const taskCompletionRate = tasks.length ? (doneTasks / tasks.length) * 100 : 0;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "done" && isOverdue(t.dueDate)
  ).length;

  // 今月の売上改善額（最新月 - 前月 の合計）
  let monthlySalesImprovement = 0;
  for (const s of stores) {
    const series = getKpiSeries(s.id, "sales");
    if (series.length >= 2) {
      const last = series[series.length - 1]?.actual ?? 0;
      const prev = series[series.length - 2]?.actual ?? 0;
      monthlySalesImprovement += Math.max(0, last - prev);
    }
  }

  // 次回ミーティング
  const upcoming = stores
    .filter((s) => s.nextMeetingDate)
    .sort((a, b) => (a.nextMeetingDate ?? "").localeCompare(b.nextMeetingDate ?? ""))[0];

  // KPI 未入力の店舗（当月データ無し）
  const currentMonth = "2026-07";
  const kpiMissingStores = stores.filter(
    (s) => !getKpiByStore(s.id).some((k) => k.month === currentMonth)
  );

  // 注意が必要な店舗
  const attentionStores: { store: Store; reason: string }[] = [];
  for (const s of stores) {
    const salesSeries = getKpiSeries(s.id, "sales");
    const last = salesSeries[salesSeries.length - 1];
    const overdue = getTasksByStore(s.id).filter(
      (t) => t.status !== "done" && isOverdue(t.dueDate)
    ).length;
    if (last?.actual != null && last.target != null) {
      const rate = achievementRate(last.actual, last.target) ?? 100;
      if (rate < 80) {
        attentionStores.push({ store: s, reason: `売上目標達成率 ${rate.toFixed(0)}%` });
        continue;
      }
    }
    if (overdue > 0) {
      attentionStores.push({ store: s, reason: `期限超過タスク ${overdue}件` });
    }
  }

  // 成果ランキング（売上改善額順）
  const storeRanking = stores
    .map((s) => {
      const series = getKpiSeries(s.id, "sales");
      const last = series[series.length - 1];
      const prev = series[series.length - 2];
      const improvement =
        last?.actual != null && prev?.actual != null ? last.actual - prev.actual : 0;
      const achievement =
        last?.actual != null && last.target != null
          ? achievementRate(last.actual, last.target) ?? 0
          : 0;
      return { store: s, improvement, achievement };
    })
    .sort((a, b) => b.improvement - a.improvement);

  // 担当者ごとの負荷
  const consultantLoad = getUsers()
    .filter((u) => u.role !== "client")
    .map((u) => ({
      user: u,
      storeCount: stores.filter((s) => s.consultantId === u.id).length,
      openTasks: tasks.filter((t) => t.assigneeId === u.id && t.status !== "done").length,
    }))
    .filter((c) => c.storeCount > 0 || c.openTasks > 0);

  return {
    activeClients: clients.length,
    activeStores: stores.length,
    monthlySalesImprovement,
    taskCompletionRate,
    overdueTasks,
    nextMeeting: upcoming?.nextMeetingDate
      ? { store: upcoming.name, date: upcoming.nextMeetingDate }
      : undefined,
    recentlyUpdated: stores
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5)
      .map((s) => ({ store: s, client: getClient(s.clientId) })),
    kpiMissingStores,
    attentionStores,
    storeRanking,
    consultantLoad,
  };
}
