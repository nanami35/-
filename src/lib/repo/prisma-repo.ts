/**
 * Supabase(PostgreSQL) 実装（Prisma 経由）。
 * DATABASE_URL 設定時に使用する。
 *
 * 各クエリは organizationId でスコープし、論理削除(deletedAt)を除外する。
 * Prisma の行を、UI が依存するドメイン型（@/types）へマッピングする。
 */
import { getPrisma } from "@/lib/prisma";
import type { Repository } from "@/lib/repo/repository";
import type {
  Organization, User, Client, Store, Hearing, Diagnosis, DiagnosisScore,
  Competitor, MarketAnalysis, Issue, Strategy, KpiRecord, Initiative,
  SocialContent, Task, Meeting, MonthlyReport, KnowledgeCase, ChecklistItem,
} from "@/types";
import type {
  ContractStatus, ContractPlan, SupportPhase, IssueStatus,
  InitiativeStatus, SocialStatus, TaskStatus, Priority, ReportStatus, KpiCategory, Role,
} from "@/lib/constants";

/* ---------------- 変換ヘルパー ---------------- */
const iso = (d: Date | null | undefined): string | undefined =>
  d ? d.toISOString() : undefined;
const isoReq = (d: Date): string => d.toISOString();
const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

function base(row: {
  organizationId: string; createdAt: Date; updatedAt: Date;
  createdBy?: string | null; updatedBy?: string | null; deletedAt?: Date | null;
}) {
  return {
    organizationId: row.organizationId,
    createdAt: isoReq(row.createdAt),
    updatedAt: isoReq(row.updatedAt),
    createdBy: row.createdBy ?? "",
    updatedBy: row.updatedBy ?? "",
    deletedAt: iso(row.deletedAt) ?? null,
  };
}

/* ---------------- リポジトリ生成 ---------------- */
export function createPrismaRepo(orgId: string): Repository {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Prisma Client を初期化できません（DATABASE_URL 未設定）。");

  const scope = { organizationId: orgId, deletedAt: null } as const;

  return {
    async getOrganizations(): Promise<Organization[]> {
      const rows = await prisma.organization.findMany({ where: { id: orgId } });
      return rows.map((o) => ({
        id: o.id, name: o.name, plan: o.plan, createdAt: isoReq(o.createdAt),
      }));
    },

    async getUsers(): Promise<User[]> {
      const rows = await prisma.user.findMany({ where: scope, orderBy: { createdAt: "asc" } });
      return rows.map((u) => ({
        ...base(u), id: u.id, name: u.name, email: u.email, role: u.role as Role,
        title: opt(u.title), avatarColor: opt(u.avatarColor), active: u.active,
        clientId: opt(u.clientId),
      }));
    },

    async getClients(): Promise<Client[]> {
      const rows = await prisma.client.findMany({ where: scope, orderBy: { createdAt: "asc" } });
      return rows.map((c) => ({
        ...base(c), id: c.id, name: c.name,
        representativeName: c.representativeName ?? "", contactName: c.contactName ?? "",
        phone: c.phone ?? "", email: c.email ?? "", address: c.address ?? "",
        website: opt(c.website), contractStatus: c.contractStatus as ContractStatus,
        contractStartDate: iso(c.contractStartDate), contractEndDate: iso(c.contractEndDate),
        plan: (c.plan ?? undefined) as ContractPlan | undefined, monthlyFee: opt(c.monthlyFee),
        consultantId: c.consultantId ?? "", supportGoal: opt(c.supportGoal),
        currentIssues: opt(c.currentIssues), goal: opt(c.goal), memo: opt(c.memo),
      }));
    },

    async getStores(): Promise<Store[]> {
      const rows = await prisma.store.findMany({ where: scope, orderBy: { createdAt: "asc" } });
      return rows.map((s) => ({
        ...base(s), id: s.id, clientId: s.clientId, name: s.name,
        businessType: s.businessType ?? "", genre: s.genre ?? "", address: s.address ?? "",
        openingHours: opt(s.openingHours), closedDays: opt(s.closedDays), seats: opt(s.seats),
        parkingLots: opt(s.parkingLots), avgSpend: opt(s.avgSpend), monthlySales: opt(s.monthlySales),
        monthlyCustomers: opt(s.monthlyCustomers), employees: opt(s.employees),
        takeout: s.takeout, delivery: s.delivery, reservationMethod: opt(s.reservationMethod),
        mainCustomerSegment: opt(s.mainCustomerSegment), tradeArea: opt(s.tradeArea),
        managerName: opt(s.managerName), officialUrl: opt(s.officialUrl),
        googleBusinessUrl: opt(s.googleBusinessUrl), instagramUrl: opt(s.instagramUrl),
        tiktokUrl: opt(s.tiktokUrl), lineUrl: opt(s.lineUrl), tabelogUrl: opt(s.tabelogUrl),
        hotpepperUrl: opt(s.hotpepperUrl), otherMedia: opt(s.otherMedia),
        supportStartDate: iso(s.supportStartDate), consultantId: s.consultantId ?? "",
        phase: (s.phase ?? "ヒアリング") as SupportPhase, keyIssue: opt(s.keyIssue),
        monthlyFocus: opt(s.monthlyFocus), targetGoal: opt(s.targetGoal),
        nextMeetingDate: iso(s.nextMeetingDate),
      }));
    },

    async getHearings(): Promise<Hearing[]> {
      const rows = await prisma.hearing.findMany({ where: scope });
      return rows.map((h) => ({
        ...base(h), id: h.id, storeId: h.storeId,
        status: h.status as "draft" | "completed",
        fields: (h.fields ?? {}) as Record<string, string>,
      }));
    },

    async getDiagnoses(): Promise<Diagnosis[]> {
      const rows = await prisma.diagnosis.findMany({
        where: scope, include: { scores: true }, orderBy: { date: "desc" },
      });
      return rows.map((d) => ({
        ...base(d), id: d.id, storeId: d.storeId, date: isoReq(d.date),
        evaluatorId: d.evaluatorId ?? "", summary: opt(d.summary),
        totalScore: opt(d.totalScore),
        scores: d.scores.map<DiagnosisScore>((sc) => ({
          itemLabel: sc.itemLabel, categoryKey: sc.categoryKey, score: sc.score,
          comment: opt(sc.comment), issue: opt(sc.issue), improvement: opt(sc.improvement),
          priority: (sc.priority ?? undefined) as Priority | undefined,
        })),
      }));
    },

    async getCompetitors(): Promise<Competitor[]> {
      const rows = await prisma.competitor.findMany({ where: scope });
      return rows.map((c) => ({
        ...base(c), id: c.id, storeId: c.storeId, name: c.name, url: opt(c.url),
        distanceKm: opt(c.distanceKm), businessType: opt(c.businessType), target: opt(c.target),
        priceRange: opt(c.priceRange), avgSpend: opt(c.avgSpend),
        signatureProduct: opt(c.signatureProduct), strengths: opt(c.strengths),
        weaknesses: opt(c.weaknesses), googleRating: opt(c.googleRating),
        reviewCount: opt(c.reviewCount), snsFollowers: opt(c.snsFollowers),
        postFrequency: opt(c.postFrequency), threatLevel: c.threatLevel as 1 | 2 | 3,
      }));
    },

    async getMarketAnalyses(): Promise<MarketAnalysis[]> {
      const rows = await prisma.marketAnalysis.findMany({ where: scope });
      return rows.map((m) => ({
        ...base(m), id: m.id, storeId: m.storeId, marketSize: opt(m.marketSize),
        marketGrowth: opt(m.marketGrowth), trends: opt(m.trends),
        customerNeeds: opt(m.customerNeeds), opportunities: opt(m.opportunities),
        threats: opt(m.threats),
      }));
    },

    async getIssues(): Promise<Issue[]> {
      const rows = await prisma.issue.findMany({ where: scope });
      return rows.map((i) => ({
        ...base(i), id: i.id, storeId: i.storeId, title: i.title,
        category: i.category ?? "", detail: opt(i.detail), basis: opt(i.basis),
        impact: i.impact as 1 | 2 | 3, urgency: i.urgency as 1 | 2 | 3,
        difficulty: i.difficulty as 1 | 2 | 3, status: i.status as IssueStatus,
        assigneeId: opt(i.assigneeId), foundDate: isoReq(i.foundDate),
        dueDate: iso(i.dueDate), relatedKpi: opt(i.relatedKpi),
      }));
    },

    async getStrategies(): Promise<Strategy[]> {
      const rows = await prisma.strategy.findMany({ where: scope });
      return rows.map((s) => ({
        ...base(s), id: s.id, storeId: s.storeId, goal: s.goal, theme: opt(s.theme),
        target: opt(s.target), positioning: opt(s.positioning), reasonChosen: opt(s.reasonChosen),
        centerPin: opt(s.centerPin), keyIssues: opt(s.keyIssues), period: opt(s.period),
        budget: opt(s.budget), assigneeId: opt(s.assigneeId),
        acquisitionTactics: opt(s.acquisitionTactics), salesTactics: opt(s.salesTactics),
      }));
    },

    async getKpiRecords(): Promise<KpiRecord[]> {
      const rows = await prisma.kpiRecord.findMany({ where: scope });
      return rows.map((k) => ({
        ...base(k), id: k.id, storeId: k.storeId, month: k.month,
        category: k.category as KpiCategory, kpiKey: k.kpiKey,
        actual: k.actual, target: k.target, comment: opt(k.comment),
      }));
    },

    async getInitiatives(): Promise<Initiative[]> {
      const rows = await prisma.initiative.findMany({ where: scope });
      return rows.map((i) => ({
        ...base(i), id: i.id, storeId: i.storeId, name: i.name, category: i.category ?? "",
        purpose: opt(i.purpose), targetCustomer: opt(i.targetCustomer), hypothesis: opt(i.hypothesis),
        content: opt(i.content), channel: opt(i.channel), startDate: iso(i.startDate),
        endDate: iso(i.endDate), budget: opt(i.budget), assigneeId: opt(i.assigneeId),
        kpiKey: opt(i.kpiKey), targetValue: opt(i.targetValue), actualValue: opt(i.actualValue),
        status: i.status as InitiativeStatus, result: opt(i.result), goodPoints: opt(i.goodPoints),
        improvements: opt(i.improvements), nextAction: opt(i.nextAction),
      }));
    },

    async getSocialContents(): Promise<SocialContent[]> {
      const rows = await prisma.socialContent.findMany({ where: scope });
      return rows.map((s) => ({
        ...base(s), id: s.id, storeId: s.storeId, platform: s.platform, theme: s.theme,
        purpose: opt(s.purpose), target: opt(s.target), format: opt(s.format), title: opt(s.title),
        caption: opt(s.caption), script: opt(s.script), assigneeId: opt(s.assigneeId),
        shootDate: iso(s.shootDate), postDate: iso(s.postDate), status: s.status as SocialStatus,
        postUrl: opt(s.postUrl), metrics: opt(s.metrics), retrospective: opt(s.retrospective),
      }));
    },

    async getTasks(): Promise<Task[]> {
      const rows = await prisma.task.findMany({ where: scope });
      return rows.map((t) => ({
        ...base(t), id: t.id, title: t.title, detail: opt(t.detail), assigneeId: opt(t.assigneeId),
        dueDate: iso(t.dueDate), priority: t.priority as Priority, status: t.status as TaskStatus,
        clientId: opt(t.clientId), storeId: opt(t.storeId), initiativeId: opt(t.initiativeId),
        checklist: (t.checklist ?? undefined) as ChecklistItem[] | undefined,
      }));
    },

    async getMeetings(): Promise<Meeting[]> {
      const rows = await prisma.meeting.findMany({
        where: scope, include: { actions: true }, orderBy: { datetime: "desc" },
      });
      return rows.map((m) => ({
        ...base(m), id: m.id, clientId: opt(m.clientId), storeId: opt(m.storeId),
        datetime: isoReq(m.datetime), attendees: m.attendees ?? "", agenda: opt(m.agenda),
        minutes: opt(m.minutes), decisions: opt(m.decisions), nextDate: iso(m.nextDate),
        actions: m.actions.map((a) => a.content),
      }));
    },

    async getMonthlyReports(): Promise<MonthlyReport[]> {
      const rows = await prisma.monthlyReport.findMany({ where: scope });
      return rows.map((r) => ({
        ...base(r), id: r.id, storeId: r.storeId, month: r.month,
        status: r.status as ReportStatus, sections: (r.sections ?? {}) as Record<string, string>,
      }));
    },

    async getKnowledgeCases(): Promise<KnowledgeCase[]> {
      const rows = await prisma.knowledgeCase.findMany({ where: scope });
      return rows.map((k) => ({
        ...base(k), id: k.id, title: k.title, businessType: k.businessType ?? "",
        storeScale: opt(k.storeScale), region: opt(k.region), avgSpend: opt(k.avgSpend),
        issue: opt(k.issue), initiative: opt(k.initiative), channels: k.channels,
        period: opt(k.period), beforeMetrics: opt(k.beforeMetrics), afterMetrics: opt(k.afterMetrics),
        result: opt(k.result), successFactors: opt(k.successFactors),
        reproConditions: opt(k.reproConditions), tags: k.tags,
      }));
    },
  };
}
