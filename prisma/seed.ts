/**
 * サンプルデータ投入スクリプト。
 *   npm run db:seed
 *
 * src/lib/sample-data.ts のデモデータを Supabase/PostgreSQL に投入する。
 * 明示的な id をそのまま利用し、関連を保ったまま登録する。
 */
import { PrismaClient } from "@prisma/client";
import * as db from "../src/lib/sample-data";

const prisma = new PrismaClient();

const date = (s?: string | null) => (s ? new Date(s) : null);

async function main() {
  console.log("🌱 サンプルデータの投入を開始します...");

  // 依存関係の逆順でクリーンアップ（開発用）
  await prisma.$transaction([
    prisma.diagnosisScore.deleteMany(),
    prisma.diagnosis.deleteMany(),
    prisma.kpiRecord.deleteMany(),
    prisma.initiative.deleteMany(),
    prisma.socialContent.deleteMany(),
    prisma.task.deleteMany(),
    prisma.meeting.deleteMany(),
    prisma.monthlyReport.deleteMany(),
    prisma.knowledgeCase.deleteMany(),
    prisma.competitor.deleteMany(),
    prisma.marketAnalysis.deleteMany(),
    prisma.strategy.deleteMany(),
    prisma.issue.deleteMany(),
    prisma.hearing.deleteMany(),
    prisma.store.deleteMany(),
    prisma.client.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  // 組織
  for (const o of db.organizations) {
    await prisma.organization.create({
      data: { id: o.id, name: o.name, plan: o.plan },
    });
  }

  // ユーザー
  for (const u of db.users) {
    await prisma.user.create({
      data: {
        id: u.id, organizationId: u.organizationId, name: u.name, email: u.email,
        role: u.role, title: u.title, avatarColor: u.avatarColor, active: u.active,
      },
    });
  }

  // クライアント
  for (const c of db.clients) {
    await prisma.client.create({
      data: {
        id: c.id, organizationId: c.organizationId, name: c.name,
        representativeName: c.representativeName, contactName: c.contactName,
        phone: c.phone, email: c.email, address: c.address, website: c.website,
        contractStatus: c.contractStatus, contractStartDate: date(c.contractStartDate),
        contractEndDate: date(c.contractEndDate), plan: c.plan, monthlyFee: c.monthlyFee,
        consultantId: c.consultantId, supportGoal: c.supportGoal,
        currentIssues: c.currentIssues, goal: c.goal, memo: c.memo,
      },
    });
  }

  // 店舗
  for (const s of db.stores) {
    await prisma.store.create({
      data: {
        id: s.id, organizationId: s.organizationId, clientId: s.clientId, name: s.name,
        businessType: s.businessType, genre: s.genre, address: s.address,
        openingHours: s.openingHours, closedDays: s.closedDays, seats: s.seats,
        parkingLots: s.parkingLots, avgSpend: s.avgSpend, monthlySales: s.monthlySales,
        monthlyCustomers: s.monthlyCustomers, employees: s.employees, takeout: s.takeout,
        delivery: s.delivery, reservationMethod: s.reservationMethod,
        mainCustomerSegment: s.mainCustomerSegment, tradeArea: s.tradeArea,
        managerName: s.managerName, officialUrl: s.officialUrl,
        googleBusinessUrl: s.googleBusinessUrl, instagramUrl: s.instagramUrl,
        tiktokUrl: s.tiktokUrl, lineUrl: s.lineUrl, tabelogUrl: s.tabelogUrl,
        hotpepperUrl: s.hotpepperUrl, otherMedia: s.otherMedia,
        supportStartDate: date(s.supportStartDate), consultantId: s.consultantId,
        phase: s.phase, keyIssue: s.keyIssue, monthlyFocus: s.monthlyFocus,
        targetGoal: s.targetGoal, nextMeetingDate: date(s.nextMeetingDate),
      },
    });
  }

  // ヒアリング
  for (const h of db.hearings) {
    await prisma.hearing.create({
      data: {
        id: h.id, organizationId: h.organizationId, storeId: h.storeId,
        status: h.status, fields: h.fields,
      },
    });
  }

  // 診断（スコアはネスト）
  for (const d of db.diagnoses) {
    await prisma.diagnosis.create({
      data: {
        id: d.id, organizationId: d.organizationId, storeId: d.storeId,
        date: new Date(d.date), evaluatorId: d.evaluatorId, summary: d.summary,
        totalScore: d.totalScore,
        scores: {
          create: d.scores.map((sc) => ({
            organizationId: d.organizationId, categoryKey: sc.categoryKey,
            itemLabel: sc.itemLabel, score: sc.score, comment: sc.comment,
            issue: sc.issue, improvement: sc.improvement, priority: sc.priority,
          })),
        },
      },
    });
  }

  // 市場分析
  for (const m of db.marketAnalyses) {
    await prisma.marketAnalysis.create({
      data: {
        id: m.id, organizationId: m.organizationId, storeId: m.storeId,
        marketSize: m.marketSize, marketGrowth: m.marketGrowth, trends: m.trends,
        customerNeeds: m.customerNeeds, opportunities: m.opportunities, threats: m.threats,
      },
    });
  }

  // 競合
  for (const c of db.competitors) {
    await prisma.competitor.create({
      data: {
        id: c.id, organizationId: c.organizationId, storeId: c.storeId, name: c.name,
        url: c.url, distanceKm: c.distanceKm, businessType: c.businessType, target: c.target,
        priceRange: c.priceRange, avgSpend: c.avgSpend, signatureProduct: c.signatureProduct,
        strengths: c.strengths, weaknesses: c.weaknesses, googleRating: c.googleRating,
        reviewCount: c.reviewCount, snsFollowers: c.snsFollowers,
        postFrequency: c.postFrequency, threatLevel: c.threatLevel,
      },
    });
  }

  // 課題
  for (const i of db.issues) {
    await prisma.issue.create({
      data: {
        id: i.id, organizationId: i.organizationId, storeId: i.storeId, title: i.title,
        category: i.category, detail: i.detail, basis: i.basis, impact: i.impact,
        urgency: i.urgency, difficulty: i.difficulty, status: i.status,
        assigneeId: i.assigneeId, foundDate: new Date(i.foundDate), dueDate: date(i.dueDate),
        relatedKpi: i.relatedKpi,
      },
    });
  }

  // 戦略
  for (const s of db.strategies) {
    await prisma.strategy.create({
      data: {
        id: s.id, organizationId: s.organizationId, storeId: s.storeId, goal: s.goal,
        theme: s.theme, target: s.target, positioning: s.positioning,
        reasonChosen: s.reasonChosen, centerPin: s.centerPin, keyIssues: s.keyIssues,
        period: s.period, budget: s.budget, assigneeId: s.assigneeId,
        acquisitionTactics: s.acquisitionTactics, salesTactics: s.salesTactics,
      },
    });
  }

  // KPI
  for (const k of db.kpiRecords) {
    await prisma.kpiRecord.create({
      data: {
        id: k.id, organizationId: k.organizationId, storeId: k.storeId, month: k.month,
        category: k.category, kpiKey: k.kpiKey, actual: k.actual, target: k.target,
      },
    });
  }

  // 施策
  for (const i of db.initiatives) {
    await prisma.initiative.create({
      data: {
        id: i.id, organizationId: i.organizationId, storeId: i.storeId, name: i.name,
        category: i.category, purpose: i.purpose, targetCustomer: i.targetCustomer,
        hypothesis: i.hypothesis, content: i.content, channel: i.channel,
        startDate: date(i.startDate), endDate: date(i.endDate), budget: i.budget,
        assigneeId: i.assigneeId, kpiKey: i.kpiKey, targetValue: i.targetValue,
        actualValue: i.actualValue, status: i.status, result: i.result,
        goodPoints: i.goodPoints, improvements: i.improvements, nextAction: i.nextAction,
      },
    });
  }

  // SNSコンテンツ
  for (const s of db.socialContents) {
    await prisma.socialContent.create({
      data: {
        id: s.id, organizationId: s.organizationId, storeId: s.storeId, platform: s.platform,
        theme: s.theme, purpose: s.purpose, target: s.target, format: s.format,
        title: s.title, caption: s.caption, script: s.script, assigneeId: s.assigneeId,
        shootDate: date(s.shootDate), postDate: date(s.postDate), status: s.status,
        postUrl: s.postUrl, metrics: s.metrics, retrospective: s.retrospective,
      },
    });
  }

  // タスク
  for (const t of db.tasks) {
    await prisma.task.create({
      data: {
        id: t.id, organizationId: t.organizationId, title: t.title, detail: t.detail,
        assigneeId: t.assigneeId, dueDate: date(t.dueDate), priority: t.priority,
        status: t.status, clientId: t.clientId, storeId: t.storeId,
        initiativeId: t.initiativeId, checklist: t.checklist ?? undefined,
      },
    });
  }

  // ミーティング（アクションはネスト）
  for (const m of db.meetings) {
    await prisma.meeting.create({
      data: {
        id: m.id, organizationId: m.organizationId, clientId: m.clientId, storeId: m.storeId,
        datetime: new Date(m.datetime), attendees: m.attendees, agenda: m.agenda,
        minutes: m.minutes, decisions: m.decisions, nextDate: date(m.nextDate),
        actions: { create: m.actions.map((content) => ({ organizationId: m.organizationId, content })) },
      },
    });
  }

  // 月次レポート
  for (const r of db.monthlyReports) {
    await prisma.monthlyReport.create({
      data: {
        id: r.id, organizationId: r.organizationId, storeId: r.storeId, month: r.month,
        status: r.status, sections: r.sections,
      },
    });
  }

  // ナレッジ
  for (const k of db.knowledgeCases) {
    await prisma.knowledgeCase.create({
      data: {
        id: k.id, organizationId: k.organizationId, title: k.title,
        businessType: k.businessType, storeScale: k.storeScale, region: k.region,
        avgSpend: k.avgSpend, issue: k.issue, initiative: k.initiative,
        channels: k.channels, period: k.period, beforeMetrics: k.beforeMetrics,
        afterMetrics: k.afterMetrics, result: k.result, successFactors: k.successFactors,
        reproConditions: k.reproConditions, tags: k.tags,
      },
    });
  }

  console.log("✅ サンプルデータの投入が完了しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
