/**
 * データアクセス層（org スコープ済み）。
 *
 * リポジトリ抽象（@/lib/repo）の背後で、モック / Supabase(Prisma) を切り替える。
 * 公開関数はすべて async。UI（サーバーコンポーネント）は await して利用する。
 * 単一エンティティ取得や店舗別絞り込みは、ベースのリストから JS で導出する。
 */
import { isDbConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { mockRepo } from "@/lib/repo/mock-repo";
import { createPrismaRepo } from "@/lib/repo/prisma-repo";
import type { Repository } from "@/lib/repo/repository";
import { isOverdue, achievementRate } from "@/lib/utils";
import type {
  Organization, Client, Store, User, Hearing, Diagnosis, Competitor, Issue,
  Strategy, KpiRecord, Initiative, SocialContent, Task, Meeting,
  MonthlyReport, KnowledgeCase, MarketAnalysis,
} from "@/types";

/** 現在ユーザーの organization にスコープしたリポジトリを取得する */
async function getRepo(): Promise<Repository> {
  if (!isDbConfigured()) return mockRepo;
  const user = await getCurrentUser();
  // (app)/layout で未ログインは弾かれる。念のため空 org を渡すと結果は空になる。
  return createPrismaRepo(user?.organizationId ?? "__none__");
}

/* ---------------- Organizations ---------------- */
export async function getOrganization(): Promise<Organization | undefined> {
  const repo = await getRepo();
  return (await repo.getOrganizations())[0];
}

/* ---------------- Users ---------------- */
export async function getUsers(): Promise<User[]> {
  return (await getRepo()).getUsers();
}
export async function getUser(id?: string): Promise<User | undefined> {
  if (!id) return undefined;
  return (await getUsers()).find((u) => u.id === id);
}
export async function getUserName(id?: string): Promise<string> {
  return (await getUser(id))?.name ?? "未割当";
}
/** 担当者名の解決を map 内で行うためのルックアップ */
export async function getUserMap(): Promise<Map<string, User>> {
  return new Map((await getUsers()).map((u) => [u.id, u]));
}

/* ---------------- Clients ---------------- */
export async function getClients(): Promise<Client[]> {
  return (await getRepo()).getClients();
}
export async function getClient(id: string): Promise<Client | undefined> {
  return (await getClients()).find((c) => c.id === id);
}
export async function getClientMap(): Promise<Map<string, Client>> {
  return new Map((await getClients()).map((c) => [c.id, c]));
}

/* ---------------- Stores ---------------- */
export async function getStores(): Promise<Store[]> {
  return (await getRepo()).getStores();
}
export async function getStore(id: string): Promise<Store | undefined> {
  return (await getStores()).find((s) => s.id === id);
}
export async function getStoresByClient(clientId: string): Promise<Store[]> {
  return (await getStores()).filter((s) => s.clientId === clientId);
}
export async function getStoreMap(): Promise<Map<string, Store>> {
  return new Map((await getStores()).map((s) => [s.id, s]));
}

/* ---------------- Hearings ---------------- */
export async function getHearings(): Promise<Hearing[]> {
  return (await getRepo()).getHearings();
}
export async function getHearingByStore(storeId: string): Promise<Hearing | undefined> {
  return (await getHearings()).find((h) => h.storeId === storeId);
}

/* ---------------- Diagnoses ---------------- */
export async function getDiagnoses(): Promise<Diagnosis[]> {
  return (await (await getRepo()).getDiagnoses()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}
export async function getDiagnosesByStore(storeId: string): Promise<Diagnosis[]> {
  return (await getDiagnoses()).filter((d) => d.storeId === storeId);
}
export async function getDiagnosis(id: string): Promise<Diagnosis | undefined> {
  return (await getDiagnoses()).find((d) => d.id === id);
}
export async function getLatestDiagnosis(storeId: string): Promise<Diagnosis | undefined> {
  return (await getDiagnosesByStore(storeId))[0];
}

/* ---------------- Competitors / Market ---------------- */
export async function getCompetitorsByStore(storeId: string): Promise<Competitor[]> {
  return (await (await getRepo()).getCompetitors()).filter((c) => c.storeId === storeId);
}
export async function getMarketByStore(storeId: string): Promise<MarketAnalysis | undefined> {
  return (await (await getRepo()).getMarketAnalyses()).find((m) => m.storeId === storeId);
}

/* ---------------- Issues ---------------- */
export async function getIssues(): Promise<Issue[]> {
  return (await getRepo()).getIssues();
}
export async function getIssuesByStore(storeId: string): Promise<Issue[]> {
  return (await getIssues()).filter((i) => i.storeId === storeId);
}
export async function getIssue(id: string): Promise<Issue | undefined> {
  return (await getIssues()).find((i) => i.id === id);
}
/** 優先度スコア = 影響度 × 緊急度 ×(4 - 難易度) */
export const priorityScore = (i: Issue): number =>
  i.impact * i.urgency * (4 - i.difficulty);

/* ---------------- Strategies ---------------- */
export async function getStrategyByStore(storeId: string): Promise<Strategy | undefined> {
  return (await (await getRepo()).getStrategies()).find((s) => s.storeId === storeId);
}

/* ---------------- KPI ---------------- */
export async function getKpiRecords(): Promise<KpiRecord[]> {
  return (await getRepo()).getKpiRecords();
}
export async function getKpiByStore(storeId: string): Promise<KpiRecord[]> {
  return (await getKpiRecords()).filter((k) => k.storeId === storeId);
}
export async function getKpiSeries(storeId: string, kpiKey: string): Promise<KpiRecord[]> {
  return (await getKpiByStore(storeId))
    .filter((k) => k.kpiKey === kpiKey)
    .sort((a, b) => a.month.localeCompare(b.month));
}
export async function getKpiMonths(storeId: string): Promise<string[]> {
  return Array.from(new Set((await getKpiByStore(storeId)).map((k) => k.month))).sort();
}

/* ---------------- Initiatives ---------------- */
export async function getInitiatives(): Promise<Initiative[]> {
  return (await getRepo()).getInitiatives();
}
export async function getInitiativesByStore(storeId: string): Promise<Initiative[]> {
  return (await getInitiatives()).filter((i) => i.storeId === storeId);
}
export async function getInitiative(id: string): Promise<Initiative | undefined> {
  return (await getInitiatives()).find((i) => i.id === id);
}

/* ---------------- Social ---------------- */
export async function getSocialContents(): Promise<SocialContent[]> {
  return (await getRepo()).getSocialContents();
}
export async function getSocialByStore(storeId: string): Promise<SocialContent[]> {
  return (await getSocialContents()).filter((s) => s.storeId === storeId);
}

/* ---------------- Tasks ---------------- */
export async function getTasks(): Promise<Task[]> {
  return (await getRepo()).getTasks();
}
export async function getTask(id: string): Promise<Task | undefined> {
  return (await getTasks()).find((t) => t.id === id);
}
export async function getTasksByStore(storeId: string): Promise<Task[]> {
  return (await getTasks()).filter((t) => t.storeId === storeId);
}

/* ---------------- Meetings ---------------- */
export async function getMeetings(): Promise<Meeting[]> {
  return (await getRepo()).getMeetings();
}

/* ---------------- Reports ---------------- */
export async function getReports(): Promise<MonthlyReport[]> {
  return (await getRepo()).getMonthlyReports();
}
export async function getReport(id: string): Promise<MonthlyReport | undefined> {
  return (await getReports()).find((r) => r.id === id);
}
export async function getReportsByStore(storeId: string): Promise<MonthlyReport[]> {
  return (await getReports())
    .filter((r) => r.storeId === storeId)
    .sort((a, b) => b.month.localeCompare(a.month));
}

/* ---------------- Knowledge ---------------- */
export async function getKnowledgeCases(): Promise<KnowledgeCase[]> {
  return (await getRepo()).getKnowledgeCases();
}

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

export async function getDashboardMetrics(filter?: {
  clientId?: string;
  storeId?: string;
  consultantId?: string;
}): Promise<DashboardMetrics> {
  const repo = await getRepo();
  const [allStores, allClients, allTasks, allKpi, allUsers, allMeetings] =
    await Promise.all([
      repo.getStores(),
      repo.getClients(),
      repo.getTasks(),
      repo.getKpiRecords(),
      repo.getUsers(),
      repo.getMeetings(),
    ]);

  let stores = allStores;
  if (filter?.clientId) stores = stores.filter((s) => s.clientId === filter.clientId);
  if (filter?.storeId) stores = stores.filter((s) => s.id === filter.storeId);
  if (filter?.consultantId)
    stores = stores.filter((s) => s.consultantId === filter.consultantId);

  const storeIds = new Set(stores.map((s) => s.id));
  const clientById = new Map(allClients.map((c) => [c.id, c]));

  const kpiSeries = (storeId: string, key: string): KpiRecord[] =>
    allKpi
      .filter((k) => k.storeId === storeId && k.kpiKey === key)
      .sort((a, b) => a.month.localeCompare(b.month));

  const clients = allClients.filter(
    (c) => c.contractStatus === "active" && stores.some((s) => s.clientId === c.id)
  );

  const tasks = allTasks.filter((t) => !t.storeId || storeIds.has(t.storeId));
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const taskCompletionRate = tasks.length ? (doneTasks / tasks.length) * 100 : 0;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "done" && isOverdue(t.dueDate)
  ).length;

  let monthlySalesImprovement = 0;
  for (const s of stores) {
    const series = kpiSeries(s.id, "sales");
    if (series.length >= 2) {
      const last = series[series.length - 1]?.actual ?? 0;
      const prev = series[series.length - 2]?.actual ?? 0;
      monthlySalesImprovement += Math.max(0, last - prev);
    }
  }

  const upcoming = stores
    .filter((s) => s.nextMeetingDate)
    .sort((a, b) => (a.nextMeetingDate ?? "").localeCompare(b.nextMeetingDate ?? ""))[0];

  const currentMonth = "2026-07";
  const kpiMissingStores = stores.filter(
    (s) => !allKpi.some((k) => k.storeId === s.id && k.month === currentMonth)
  );

  const attentionStores: { store: Store; reason: string }[] = [];
  for (const s of stores) {
    const series = kpiSeries(s.id, "sales");
    const last = series[series.length - 1];
    const overdue = tasks.filter(
      (t) => t.storeId === s.id && t.status !== "done" && isOverdue(t.dueDate)
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

  const storeRanking = stores
    .map((s) => {
      const series = kpiSeries(s.id, "sales");
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

  const consultantLoad = allUsers
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
      .map((s) => ({ store: s, client: clientById.get(s.clientId) })),
    kpiMissingStores,
    attentionStores,
    storeRanking,
    consultantLoad,
  };
}
