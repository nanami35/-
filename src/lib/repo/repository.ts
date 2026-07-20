/**
 * リポジトリ抽象。
 * データソース（モック / Supabase(Prisma)）はこのインターフェースの背後に隠す。
 *
 * 各メソッドは「論理削除されていない、指定 organization に属する全行」を返す。
 * 単一店舗・単一月などの絞り込みは data.ts 側で JS フィルタとして導出する
 * （MVP 規模ではこの単純化で十分。将来クエリ最適化する場合はメソッドを追加する）。
 */
import type {
  Organization, User, Client, Store, Hearing, Diagnosis, Competitor,
  MarketAnalysis, Issue, Strategy, KpiRecord, Initiative, SocialContent,
  Task, Meeting, MonthlyReport, KnowledgeCase,
} from "@/types";

export interface Repository {
  getOrganizations(): Promise<Organization[]>;
  getUsers(): Promise<User[]>;
  getClients(): Promise<Client[]>;
  getStores(): Promise<Store[]>;
  getHearings(): Promise<Hearing[]>;
  getDiagnoses(): Promise<Diagnosis[]>;
  getCompetitors(): Promise<Competitor[]>;
  getMarketAnalyses(): Promise<MarketAnalysis[]>;
  getIssues(): Promise<Issue[]>;
  getStrategies(): Promise<Strategy[]>;
  getKpiRecords(): Promise<KpiRecord[]>;
  getInitiatives(): Promise<Initiative[]>;
  getSocialContents(): Promise<SocialContent[]>;
  getTasks(): Promise<Task[]>;
  getMeetings(): Promise<Meeting[]>;
  getMonthlyReports(): Promise<MonthlyReport[]>;
  getKnowledgeCases(): Promise<KnowledgeCase[]>;
}
