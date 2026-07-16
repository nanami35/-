/**
 * ドメイン型定義。
 * MVP のモックデータ層と UI はこの型に依存する。
 * 将来 Prisma へ接続する際も、この型を境界として維持する。
 */
import type {
  Role,
  ContractStatus,
  ContractPlan,
  SupportPhase,
  IssueStatus,
  InitiativeStatus,
  SocialStatus,
  TaskStatus,
  Priority,
  ReportStatus,
  KpiCategory,
} from "@/lib/constants";

export type ID = string;

/** 全エンティティ共通の監査カラム */
export interface BaseEntity {
  id: ID;
  organizationId: ID;
  createdAt: string;
  updatedAt: string;
  createdBy: ID;
  updatedBy: ID;
  deletedAt?: string | null;
}

export interface Organization {
  id: ID;
  name: string;
  plan: string;
  createdAt: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: Role;
  title?: string;
  avatarColor?: string;
  active: boolean;
  /** クライアントロールの場合、所属するクライアント企業 */
  clientId?: ID;
}

export interface Client extends BaseEntity {
  name: string;
  representativeName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  contractStatus: ContractStatus;
  contractStartDate?: string;
  contractEndDate?: string;
  plan?: ContractPlan;
  monthlyFee?: number;
  consultantId: ID;
  supportGoal?: string;
  currentIssues?: string;
  goal?: string;
  memo?: string;
}

export interface Store extends BaseEntity {
  clientId: ID;
  name: string;
  businessType: string; // 業態
  genre: string; // ジャンル
  address: string;
  openingHours?: string;
  closedDays?: string;
  seats?: number;
  parkingLots?: number;
  avgSpend?: number;
  monthlySales?: number;
  monthlyCustomers?: number;
  employees?: number;
  takeout?: boolean;
  delivery?: boolean;
  reservationMethod?: string;
  mainCustomerSegment?: string;
  tradeArea?: string;
  managerName?: string;
  // 外部媒体
  officialUrl?: string;
  googleBusinessUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  lineUrl?: string;
  tabelogUrl?: string;
  hotpepperUrl?: string;
  otherMedia?: string;
  // 支援情報
  supportStartDate?: string;
  consultantId: ID;
  phase: SupportPhase;
  keyIssue?: string;
  monthlyFocus?: string;
  targetGoal?: string;
  nextMeetingDate?: string;
}

export interface Hearing extends BaseEntity {
  storeId: ID;
  status: "draft" | "completed";
  fields: Record<string, string>;
}

export interface DiagnosisScore {
  itemLabel: string;
  categoryKey: string;
  score: number; // 1-5
  comment?: string;
  issue?: string;
  improvement?: string;
  priority?: Priority;
}

export interface Diagnosis extends BaseEntity {
  storeId: ID;
  date: string;
  evaluatorId: ID;
  scores: DiagnosisScore[];
  summary?: string;
  /** カテゴリ別 100点換算スコア（自動計算のキャッシュ） */
  categoryScores?: Record<string, number>;
  totalScore?: number;
}

export interface Competitor extends BaseEntity {
  storeId: ID;
  name: string;
  url?: string;
  distanceKm?: number;
  businessType?: string;
  target?: string;
  priceRange?: string;
  avgSpend?: number;
  signatureProduct?: string;
  strengths?: string;
  weaknesses?: string;
  googleRating?: number;
  reviewCount?: number;
  snsFollowers?: number;
  postFrequency?: string;
  threatLevel: 1 | 2 | 3;
}

export interface MarketAnalysis extends BaseEntity {
  storeId: ID;
  marketSize?: string;
  marketGrowth?: string;
  trends?: string;
  customerNeeds?: string;
  opportunities?: string;
  threats?: string;
}

export interface Issue extends BaseEntity {
  storeId: ID;
  title: string;
  category: string;
  detail?: string;
  basis?: string;
  impact: 1 | 2 | 3;
  urgency: 1 | 2 | 3;
  difficulty: 1 | 2 | 3;
  status: IssueStatus;
  assigneeId?: ID;
  foundDate: string;
  dueDate?: string;
  relatedKpi?: string;
}

export interface Strategy extends BaseEntity {
  storeId: ID;
  goal: string;
  theme?: string;
  target?: string;
  positioning?: string;
  reasonChosen?: string;
  centerPin?: string; // センターピン
  keyIssues?: string;
  period?: string;
  budget?: number;
  assigneeId?: ID;
  acquisitionTactics?: string;
  salesTactics?: string;
}

export interface KpiRecord extends BaseEntity {
  storeId: ID;
  month: string; // YYYY-MM
  category: KpiCategory;
  kpiKey: string;
  actual: number | null;
  target: number | null;
  comment?: string;
}

export interface Initiative extends BaseEntity {
  storeId: ID;
  name: string;
  category: string;
  purpose?: string;
  targetCustomer?: string;
  hypothesis?: string;
  content?: string;
  channel?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  assigneeId?: ID;
  kpiKey?: string;
  targetValue?: number;
  actualValue?: number;
  status: InitiativeStatus;
  result?: string;
  goodPoints?: string;
  improvements?: string;
  nextAction?: string;
}

export interface SocialContent extends BaseEntity {
  storeId: ID;
  platform: string;
  theme: string;
  purpose?: string;
  target?: string;
  format?: string;
  title?: string;
  caption?: string;
  script?: string;
  assigneeId?: ID;
  shootDate?: string;
  postDate?: string;
  status: SocialStatus;
  postUrl?: string;
  metrics?: string;
  retrospective?: string;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface Task extends BaseEntity {
  title: string;
  detail?: string;
  assigneeId?: ID;
  dueDate?: string;
  priority: Priority;
  status: TaskStatus;
  clientId?: ID;
  storeId?: ID;
  initiativeId?: ID;
  checklist?: ChecklistItem[];
}

export interface Meeting extends BaseEntity {
  clientId?: ID;
  storeId?: ID;
  datetime: string;
  attendees: string;
  agenda?: string;
  minutes?: string;
  decisions?: string;
  nextDate?: string;
  actions: string[];
}

export interface MonthlyReport extends BaseEntity {
  storeId: ID;
  month: string; // YYYY-MM
  status: ReportStatus;
  sections: Record<string, string>;
}

export interface KnowledgeCase extends BaseEntity {
  title: string;
  businessType: string;
  storeScale?: string;
  region?: string;
  avgSpend?: number;
  issue?: string;
  initiative?: string;
  channels: string[];
  period?: string;
  beforeMetrics?: string;
  afterMetrics?: string;
  result?: string;
  successFactors?: string;
  reproConditions?: string;
  tags: string[];
}

export interface ActivityLog {
  id: ID;
  organizationId: ID;
  userId: ID;
  action: string;
  target: string;
  createdAt: string;
}
