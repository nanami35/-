// =====================================================================
// ABENGERS KNOWLEDGE OS - ドメイン型定義
// 要件定義書 第14章「データベース設計」に対応する厳密な型。
// =====================================================================

// --- 共通の列挙型 ----------------------------------------------------

/** 承認フローのステータス(要件 8-14) */
export type Status =
  | "draft" // 下書き
  | "ai_processing" // AI整理中
  | "pending_review" // 確認待ち
  | "revision_requested" // 修正依頼
  | "approved" // 承認済み
  | "published" // 公開済み
  | "unpublished" // 非公開
  | "needs_recheck" // 要再確認
  | "archived"; // アーカイブ

/** 公開範囲(要件 10) */
export type Visibility =
  | "all_staff" // 全社員
  | "seed_group" // SEEDグループ共通
  | "abengers_only" // ABENGERSのみ
  | "koeni_only" // コエニのみ
  | "own_company" // 所属企業のみ
  | "managers" // 管理職のみ
  | "executives" // 役員のみ
  | "project_members" // プロジェクトメンバーのみ
  | "specified_users" // 指定ユーザーのみ
  | "admins" // 管理者のみ
  | "private"; // 自分のみ

/** 情報信頼度(要件 9) A:一次 / B:高信頼二次 / C:参考・仮説 */
export type ConfidenceLevel = "A" | "B" | "C";

/** 確定度(要件 9) */
export type CertaintyLevel =
  | "confirmed" // 確定情報
  | "strong" // 有力情報
  | "hypothesis" // 仮説
  | "unverified" // 未検証
  | "needs_check"; // 要確認

/** ロール(要件 10) */
export type Role =
  | "super_admin" // スーパー管理者
  | "group_admin" // グループ管理者
  | "company_admin" // 企業管理者
  | "approver" // 承認者
  | "editor" // 編集者
  | "member" // 一般ユーザー
  | "viewer" // 閲覧専用
  | "guest"; // 外部ゲスト

/** 情報区分(要件 9) */
export type InfoClass =
  | "external_public" // 外部公開情報
  | "internal" // 社内情報
  | "customer_confidential" // 顧客機密情報
  | "personal"; // 個人用情報

// --- 共通基底 --------------------------------------------------------

/** すべての主要テーブルが持つ共通カラム(要件 14) */
export interface BaseEntity {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  status: Status;
  visibility: Visibility;
  confidenceLevel: ConfidenceLevel;
  certaintyLevel: CertaintyLevel;
  // 論理削除
  deletedAt?: string | null;
  deletedBy?: string | null;
  // 情報鮮度管理(要件 8-15)
  sourceObtainedAt?: string; // 情報取得日
  lastVerifiedAt?: string; // 最終確認日
  nextReviewAt?: string; // 次回確認期限
}

// --- 組織・ユーザー --------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  slug: string;
  kind: "group" | "company";
  parentId?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  // デモ用。本番は Supabase Auth のハッシュを利用。
  password: string;
  name: string;
  organizationId: string;
  role: Role;
  title?: string;
  isExecutive?: boolean;
  isManager?: boolean;
  avatarColor?: string;
  createdAt: string;
}

/** クライアントへ渡す安全なユーザー(パスワードを除去) */
export type SafeUser = Omit<User, "password">;

// --- 企業図鑑(要件 8-5) --------------------------------------------

export interface Company extends BaseEntity {
  name: string;
  nameKana?: string;
  nameEn?: string;
  logoText?: string; // ロゴ代替(頭文字)
  website?: string;
  foundedYear?: number;
  representative?: string;
  founder?: string;
  location?: string;
  employees?: string;
  revenue?: string;
  operatingProfit?: string;
  listingStatus?: string; // 上場区分
  tickerCode?: string;
  industry?: string;
  category: string; // 企業カテゴリ(ビジネスモデル分類)
  groupCompanies?: string[];
  relatedPersonIds?: string[];
  tags?: string[];

  // 事業モデル
  businessModel: {
    targetCustomer?: string;
    customerProblem?: string;
    valueProposition?: string;
    products?: string;
    pricing?: string;
    contractTerm?: string;
    salesMethod?: string;
    revenueModel?: string;
    costStructure?: string;
    retention?: string;
    growthModel?: string;
    competitiveEdge?: string;
    supportScope?: string;
    managementScope?: string; // 経営責任の範囲
    hasInvestment?: boolean;
    hasStaffing?: boolean; // 人材派遣
    hasPerformanceFee?: boolean; // 成果報酬
    hasExit?: boolean;
  };

  // 経営分析
  analysis: {
    successFactors?: string[];
    centerPin?: string; // 成長のセンターピン
    salesMethod?: string;
    hiringMethod?: string;
    developmentMethod?: string;
    orgStructure?: string;
    kpis?: string[];
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
    risks?: string[];
    failureFactors?: string[];
    outlook?: string;
  };

  // 自社への応用
  application: {
    abengersLearnings?: string[];
    koeniLearnings?: string[];
    copyableMechanisms?: string[];
    avoidPoints?: string[];
    diffFromAbengers?: string;
    diffFromKoeni?: string;
    actionCandidates?: string[];
    priority?: "high" | "medium" | "low";
    owner?: string;
    dueDate?: string;
    executionStatus?: string;
    executionResult?: string;
  };

  relatedNews?: { title: string; url?: string; date?: string }[];
}

// --- 経営者・人物図鑑(要件 8-6) -----------------------------------

export interface Person extends BaseEntity {
  name: string;
  photoText?: string;
  companyId?: string;
  companyName?: string;
  title?: string;
  career?: string;
  achievements?: string[];
  philosophy?: string;
  decisionStyle?: string;
  strengths?: string[];
  failures?: string[];
  quotes?: string[];
  relatedArticles?: { title: string; url?: string }[];
  relatedCompanyIds?: string[];
  abengersLearnings?: string[];
  sources?: string[];
  tags?: string[];
}

// --- ビジネスモデル図鑑(要件 8-7) ---------------------------------

export interface BusinessModel extends BaseEntity {
  name: string;
  definition: string;
  targetCustomer?: string;
  customerProblem?: string;
  valueProposition?: string;
  supportScope?: string;
  revenueSources?: string[];
  pricingModel?: string;
  managementResponsibility?: string;
  investment?: TriState;
  equityHolding?: TriState;
  cxoDispatch?: TriState;
  handsOnSupport?: TriState;
  performanceFee?: TriState;
  exit?: TriState;
  profitMargin?: string;
  continuity?: string;
  reproducibility?: string;
  scalability?: string;
  mainRisks?: string[];
  representativeCompanyIds?: string[];
  successCases?: string[];
  failureCases?: string[];
  commonWithAbengers?: string[];
  diffFromAbengers?: string[];
  commonWithKoeni?: string[];
  diffFromKoeni?: string[];
  tags?: string[];
}

export type TriState = "yes" | "no" | "partial" | "unknown";

// --- 比較マトリクス(要件 8-8) --------------------------------------

/** 評価記号 */
export type ScoreSymbol =
  | "double_circle" // ◎
  | "circle" // ○
  | "triangle" // △
  | "cross" // ×
  | "n/a" // 対象外
  | "unknown"; // 不明

export interface ComparisonMatrix {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  targetKind: "company" | "business_model";
  targetIds: string[]; // 比較対象(企業 or モデルの id or キー)
  items: ComparisonItem[];
  scores: ComparisonScore[];
  createdAt: string;
  createdBy: string;
}

export interface ComparisonItem {
  id: string;
  label: string;
  order: number;
}

export interface ComparisonScore {
  targetId: string;
  itemId: string;
  symbol: ScoreSymbol;
  note?: string; // 根拠
  source?: string; // 出典
}

// --- ノウハウライブラリ(要件 8-9) ---------------------------------

export interface KnowledgeArticle extends BaseEntity {
  title: string;
  category: string;
  summary?: string;
  conclusion?: string;
  background?: string;
  principles?: string;
  practice?: string; // 実践方法(Markdown)
  examples?: string;
  successExample?: string;
  failureExample?: string;
  cautions?: string;
  checklist?: string[];
  relatedCompanyIds?: string[];
  relatedPersonIds?: string[];
  relatedProjectIds?: string[];
  relatedCaseIds?: string[];
  sources?: string[];
  importance?: "high" | "medium" | "low";
  abengersUsage?: string;
  koeniUsage?: string;
  tags?: string[];
}

// --- 成功・失敗事例(要件 8-10) -------------------------------------

export interface CaseStudy extends BaseEntity {
  title: string;
  companyName?: string;
  companyId?: string;
  projectName?: string;
  industry?: string;
  kind: "success" | "failure";
  situation?: string;
  goal?: string;
  actions?: string;
  result?: string;
  metrics?: string;
  successFactors?: string[];
  failureFactors?: string[];
  overlookedAssumptions?: string[];
  warningSigns?: string[];
  earlyIndicators?: string[];
  preventionMeasures?: string[];
  otherApplications?: string;
  abengersImplication?: string;
  koeniImplication?: string;
  relatedKnowledgeIds?: string[];
  relatedPersonIds?: string[];
  sources?: string[];
  tags?: string[];
}

// --- 社内プロジェクト(要件 8-11) -----------------------------------

export interface Project extends BaseEntity {
  name: string;
  clientName?: string;
  belongingCompany?: string;
  industry?: string;
  projectType?: string;
  supportPhase?: string;
  leadId?: string;
  memberIds?: string[];
  startDate?: string;
  endDate?: string;
  projectStatus?: string; // 現在のステータス
  background?: string;
  customerProblem?: string;
  goal?: string;
  kpis?: { label: string; target: string; current?: string }[];
  supportContent?: string;
  actions?: string;
  decisions?: string[];
  result?: string;
  metrics?: string;
  currentIssues?: string;
  risks?: string;
  reusableKnowledgeIds?: string[];
  relatedCompanyIds?: string[];
  tags?: string[];
}

// --- 会議記録・意思決定(要件 8-12) ---------------------------------

export interface Meeting extends BaseEntity {
  title: string;
  heldAt?: string;
  participants?: string[];
  projectId?: string;
  agenda?: string;
  minutes?: string;
  decisions?: Decision[];
  actionItems?: ActionItem[];
  nextReviewDate?: string;
  relatedCompanyIds?: string[];
  aiSummary?: string;
  tags?: string[];
}

export interface Decision {
  id: string;
  content: string;
  reason?: string;
  rejectedAlternatives?: string;
  assumptions?: string;
}

export interface ActionItem {
  id: string;
  content: string;
  owner?: string;
  dueDate?: string;
  done?: boolean;
}

// --- 情報ソース管理(要件 8-16) -------------------------------------

export interface Source extends BaseEntity {
  name: string;
  url?: string;
  sourceType: string;
  targetCompanyId?: string;
  targetCategory?: string;
  updateFrequency?: string;
  lastFetchedAt?: string;
  nextFetchAt?: string;
  autoFetch?: boolean;
  errorState?: string;
  owner?: string;
}

// --- 通知(要件 8-18) -----------------------------------------------

export type NotificationLevel = "urgent" | "important" | "normal" | "reference";

export interface Notification {
  id: string;
  organizationId: string;
  userId: string; // 宛先
  level: NotificationLevel;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// --- コメント(要件 8-19) -------------------------------------------

export interface Comment {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  authorId: string;
  body: string;
  mentions?: string[];
  parentId?: string | null;
  resolved?: boolean;
  createdAt: string;
}

// --- お気に入り・履歴(要件 8-20) -----------------------------------

export interface Favorite {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  viewedAt: string;
}

// --- 監査ログ(要件 18) ---------------------------------------------

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  detail?: string;
  createdAt: string;
}

// --- AIチャット(要件 8-4) ------------------------------------------

export interface AiCitation {
  entityType: string;
  entityId: string;
  title: string;
  confidenceLevel: ConfidenceLevel;
  certaintyLevel: CertaintyLevel;
  isInternal: boolean;
  sourceObtainedAt?: string;
  lastVerifiedAt?: string;
  sourceUrl?: string;
  snippet?: string;
}

export interface AiAnswer {
  answer: string;
  reasoningNote?: string; // AIが推論した部分の明示
  citations: AiCitation[];
  hasEnoughInfo: boolean;
  isMock: boolean;
}

// エンティティ種別の共通ラベル
export type EntityType =
  | "company"
  | "person"
  | "business_model"
  | "knowledge"
  | "case"
  | "project"
  | "meeting"
  | "source";
