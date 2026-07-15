-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'marketer', 'client');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('prospect', 'negotiating', 'active', 'paused', 'ended');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('open', 'in_progress', 'resolved', 'monitoring');

-- CreateEnum
CREATE TYPE "InitiativeStatus" AS ENUM ('planned', 'in_progress', 'completed', 'paused', 'cancelled');

-- CreateEnum
CREATE TYPE "SocialStatus" AS ENUM ('idea', 'planning', 'shooting', 'editing', 'review', 'fixing', 'scheduled', 'posted', 'analyzed');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'review', 'done');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('draft', 'review', 'approved', 'shared');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "authUserId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'marketer',
    "title" TEXT,
    "avatarColor" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "representativeName" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "website" TEXT,
    "contractStatus" "ContractStatus" NOT NULL DEFAULT 'prospect',
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "plan" TEXT,
    "monthlyFee" INTEGER,
    "consultantId" TEXT,
    "supportGoal" TEXT,
    "currentIssues" TEXT,
    "goal" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessType" TEXT,
    "genre" TEXT,
    "address" TEXT,
    "openingHours" TEXT,
    "closedDays" TEXT,
    "seats" INTEGER,
    "parkingLots" INTEGER,
    "avgSpend" INTEGER,
    "monthlySales" INTEGER,
    "monthlyCustomers" INTEGER,
    "employees" INTEGER,
    "takeout" BOOLEAN NOT NULL DEFAULT false,
    "delivery" BOOLEAN NOT NULL DEFAULT false,
    "reservationMethod" TEXT,
    "mainCustomerSegment" TEXT,
    "tradeArea" TEXT,
    "managerName" TEXT,
    "officialUrl" TEXT,
    "googleBusinessUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "lineUrl" TEXT,
    "tabelogUrl" TEXT,
    "hotpepperUrl" TEXT,
    "otherMedia" TEXT,
    "supportStartDate" TIMESTAMP(3),
    "consultantId" TEXT,
    "phase" TEXT,
    "keyIssue" TEXT,
    "monthlyFocus" TEXT,
    "targetGoal" TEXT,
    "nextMeetingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "monthlyFee" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "ContractStatus" NOT NULL DEFAULT 'active',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "client_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hearings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "hearings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "evaluatorId" TEXT,
    "summary" TEXT,
    "totalScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_scores" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,
    "itemId" TEXT,
    "categoryKey" TEXT NOT NULL,
    "itemLabel" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "issue" TEXT,
    "improvement" TEXT,
    "priority" "Priority",
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_analyses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "marketSize" TEXT,
    "marketGrowth" TEXT,
    "trends" TEXT,
    "customerNeeds" TEXT,
    "opportunities" TEXT,
    "threats" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "market_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_area_analyses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "range" TEXT,
    "population" TEXT,
    "daytimePopulation" TEXT,
    "nighttimePopulation" TEXT,
    "ageComposition" TEXT,
    "householdComposition" TEXT,
    "facilities" TEXT,
    "traffic" TEXT,
    "timeCharacteristics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "trade_area_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitors" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "businessType" TEXT,
    "target" TEXT,
    "priceRange" TEXT,
    "avgSpend" INTEGER,
    "signatureProduct" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "googleRating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "snsFollowers" INTEGER,
    "postFrequency" TEXT,
    "threatLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_analyses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "valueAxis" TEXT NOT NULL,
    "target" TEXT,
    "desire" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "demand_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_analyses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "valueAxis" TEXT NOT NULL,
    "content" TEXT,
    "gapNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "supply_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "detail" TEXT,
    "basis" TEXT,
    "impact" INTEGER NOT NULL DEFAULT 2,
    "urgency" INTEGER NOT NULL DEFAULT 2,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "status" "IssueStatus" NOT NULL DEFAULT 'open',
    "assigneeId" TEXT,
    "foundDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "relatedKpi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategies" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "theme" TEXT,
    "target" TEXT,
    "positioning" TEXT,
    "reasonChosen" TEXT,
    "centerPin" TEXT,
    "keyIssues" TEXT,
    "period" TEXT,
    "budget" INTEGER,
    "assigneeId" TEXT,
    "acquisitionTactics" TEXT,
    "salesTactics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_definitions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT,
    "category" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'up',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_records" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "kpiKey" TEXT NOT NULL,
    "actual" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "kpi_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "initiatives" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "purpose" TEXT,
    "targetCustomer" TEXT,
    "hypothesis" TEXT,
    "content" TEXT,
    "channel" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" INTEGER,
    "assigneeId" TEXT,
    "kpiKey" TEXT,
    "targetValue" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION,
    "status" "InitiativeStatus" NOT NULL DEFAULT 'planned',
    "result" TEXT,
    "goodPoints" TEXT,
    "improvements" TEXT,
    "nextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_contents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "purpose" TEXT,
    "target" TEXT,
    "format" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "script" TEXT,
    "assigneeId" TEXT,
    "shootDate" TIMESTAMP(3),
    "postDate" TIMESTAMP(3),
    "status" "SocialStatus" NOT NULL DEFAULT 'idea',
    "postUrl" TEXT,
    "metrics" TEXT,
    "retrospective" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "social_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "clientId" TEXT,
    "storeId" TEXT,
    "initiativeId" TEXT,
    "checklist" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "storeId" TEXT,
    "datetime" TIMESTAMP(3) NOT NULL,
    "attendees" TEXT,
    "agenda" TEXT,
    "minutes" TEXT,
    "decisions" TEXT,
    "nextDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_actions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_reports" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'draft',
    "sections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "monthly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_cases" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessType" TEXT,
    "storeScale" TEXT,
    "region" TEXT,
    "avgSpend" INTEGER,
    "issue" TEXT,
    "initiative" TEXT,
    "channels" TEXT[],
    "period" TEXT,
    "beforeMetrics" TEXT,
    "afterMetrics" TEXT,
    "result" TEXT,
    "successFactors" TEXT,
    "reproConditions" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "knowledge_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "storagePath" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "target" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_authUserId_key" ON "users"("authUserId");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "clients_organizationId_idx" ON "clients"("organizationId");

-- CreateIndex
CREATE INDEX "clients_contractStatus_idx" ON "clients"("contractStatus");

-- CreateIndex
CREATE INDEX "stores_organizationId_idx" ON "stores"("organizationId");

-- CreateIndex
CREATE INDEX "stores_clientId_idx" ON "stores"("clientId");

-- CreateIndex
CREATE INDEX "contracts_organizationId_idx" ON "contracts"("organizationId");

-- CreateIndex
CREATE INDEX "contracts_clientId_idx" ON "contracts"("clientId");

-- CreateIndex
CREATE INDEX "client_members_organizationId_idx" ON "client_members"("organizationId");

-- CreateIndex
CREATE INDEX "client_members_clientId_idx" ON "client_members"("clientId");

-- CreateIndex
CREATE INDEX "hearings_organizationId_idx" ON "hearings"("organizationId");

-- CreateIndex
CREATE INDEX "hearings_storeId_idx" ON "hearings"("storeId");

-- CreateIndex
CREATE INDEX "diagnoses_organizationId_idx" ON "diagnoses"("organizationId");

-- CreateIndex
CREATE INDEX "diagnoses_storeId_idx" ON "diagnoses"("storeId");

-- CreateIndex
CREATE INDEX "diagnosis_categories_organizationId_idx" ON "diagnosis_categories"("organizationId");

-- CreateIndex
CREATE INDEX "diagnosis_items_organizationId_idx" ON "diagnosis_items"("organizationId");

-- CreateIndex
CREATE INDEX "diagnosis_items_categoryId_idx" ON "diagnosis_items"("categoryId");

-- CreateIndex
CREATE INDEX "diagnosis_scores_organizationId_idx" ON "diagnosis_scores"("organizationId");

-- CreateIndex
CREATE INDEX "diagnosis_scores_diagnosisId_idx" ON "diagnosis_scores"("diagnosisId");

-- CreateIndex
CREATE INDEX "market_analyses_organizationId_idx" ON "market_analyses"("organizationId");

-- CreateIndex
CREATE INDEX "market_analyses_storeId_idx" ON "market_analyses"("storeId");

-- CreateIndex
CREATE INDEX "trade_area_analyses_organizationId_idx" ON "trade_area_analyses"("organizationId");

-- CreateIndex
CREATE INDEX "trade_area_analyses_storeId_idx" ON "trade_area_analyses"("storeId");

-- CreateIndex
CREATE INDEX "competitors_organizationId_idx" ON "competitors"("organizationId");

-- CreateIndex
CREATE INDEX "competitors_storeId_idx" ON "competitors"("storeId");

-- CreateIndex
CREATE INDEX "demand_analyses_organizationId_idx" ON "demand_analyses"("organizationId");

-- CreateIndex
CREATE INDEX "demand_analyses_storeId_idx" ON "demand_analyses"("storeId");

-- CreateIndex
CREATE INDEX "supply_analyses_organizationId_idx" ON "supply_analyses"("organizationId");

-- CreateIndex
CREATE INDEX "supply_analyses_storeId_idx" ON "supply_analyses"("storeId");

-- CreateIndex
CREATE INDEX "issues_organizationId_idx" ON "issues"("organizationId");

-- CreateIndex
CREATE INDEX "issues_storeId_idx" ON "issues"("storeId");

-- CreateIndex
CREATE INDEX "strategies_organizationId_idx" ON "strategies"("organizationId");

-- CreateIndex
CREATE INDEX "strategies_storeId_idx" ON "strategies"("storeId");

-- CreateIndex
CREATE INDEX "kpi_definitions_organizationId_idx" ON "kpi_definitions"("organizationId");

-- CreateIndex
CREATE INDEX "kpi_records_organizationId_idx" ON "kpi_records"("organizationId");

-- CreateIndex
CREATE INDEX "kpi_records_storeId_month_idx" ON "kpi_records"("storeId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_records_storeId_month_kpiKey_key" ON "kpi_records"("storeId", "month", "kpiKey");

-- CreateIndex
CREATE INDEX "initiatives_organizationId_idx" ON "initiatives"("organizationId");

-- CreateIndex
CREATE INDEX "initiatives_storeId_idx" ON "initiatives"("storeId");

-- CreateIndex
CREATE INDEX "social_contents_organizationId_idx" ON "social_contents"("organizationId");

-- CreateIndex
CREATE INDEX "social_contents_storeId_idx" ON "social_contents"("storeId");

-- CreateIndex
CREATE INDEX "tasks_organizationId_idx" ON "tasks"("organizationId");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "tasks_storeId_idx" ON "tasks"("storeId");

-- CreateIndex
CREATE INDEX "task_comments_organizationId_idx" ON "task_comments"("organizationId");

-- CreateIndex
CREATE INDEX "task_comments_taskId_idx" ON "task_comments"("taskId");

-- CreateIndex
CREATE INDEX "meetings_organizationId_idx" ON "meetings"("organizationId");

-- CreateIndex
CREATE INDEX "meetings_clientId_idx" ON "meetings"("clientId");

-- CreateIndex
CREATE INDEX "meeting_actions_organizationId_idx" ON "meeting_actions"("organizationId");

-- CreateIndex
CREATE INDEX "meeting_actions_meetingId_idx" ON "meeting_actions"("meetingId");

-- CreateIndex
CREATE INDEX "monthly_reports_organizationId_idx" ON "monthly_reports"("organizationId");

-- CreateIndex
CREATE INDEX "monthly_reports_storeId_idx" ON "monthly_reports"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_reports_storeId_month_key" ON "monthly_reports"("storeId", "month");

-- CreateIndex
CREATE INDEX "knowledge_cases_organizationId_idx" ON "knowledge_cases"("organizationId");

-- CreateIndex
CREATE INDEX "files_organizationId_idx" ON "files"("organizationId");

-- CreateIndex
CREATE INDEX "files_entityType_entityId_idx" ON "files"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_organizationId_idx" ON "activity_logs"("organizationId");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_members" ADD CONSTRAINT "client_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_members" ADD CONSTRAINT "client_members_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hearings" ADD CONSTRAINT "hearings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hearings" ADD CONSTRAINT "hearings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_categories" ADD CONSTRAINT "diagnosis_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_items" ADD CONSTRAINT "diagnosis_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_items" ADD CONSTRAINT "diagnosis_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "diagnosis_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_scores" ADD CONSTRAINT "diagnosis_scores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_scores" ADD CONSTRAINT "diagnosis_scores_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_scores" ADD CONSTRAINT "diagnosis_scores_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "diagnosis_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_analyses" ADD CONSTRAINT "market_analyses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_analyses" ADD CONSTRAINT "market_analyses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_area_analyses" ADD CONSTRAINT "trade_area_analyses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_area_analyses" ADD CONSTRAINT "trade_area_analyses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_analyses" ADD CONSTRAINT "demand_analyses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_analyses" ADD CONSTRAINT "demand_analyses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_analyses" ADD CONSTRAINT "supply_analyses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_analyses" ADD CONSTRAINT "supply_analyses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_records" ADD CONSTRAINT "kpi_records_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_records" ADD CONSTRAINT "kpi_records_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_contents" ADD CONSTRAINT "social_contents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_contents" ADD CONSTRAINT "social_contents_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "initiatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_actions" ADD CONSTRAINT "meeting_actions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_actions" ADD CONSTRAINT "meeting_actions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_reports" ADD CONSTRAINT "monthly_reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_reports" ADD CONSTRAINT "monthly_reports_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_cases" ADD CONSTRAINT "knowledge_cases_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

