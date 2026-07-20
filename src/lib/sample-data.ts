/**
 * デモ用サンプルデータ。
 * 架空の「株式会社サンプルダイニング / カフェ＆ダイニング HIKARI」を中心に、
 * ダッシュボードや各画面が意味のある状態で表示されるよう構成している。
 *
 * 本番では、この層を Prisma/Supabase から取得するデータに差し替える。
 */
import { DIAGNOSIS_CATEGORIES } from "@/lib/constants";
import type {
  Organization,
  User,
  Client,
  Store,
  Hearing,
  Diagnosis,
  DiagnosisScore,
  Competitor,
  Issue,
  Strategy,
  KpiRecord,
  Initiative,
  SocialContent,
  Task,
  Meeting,
  MonthlyReport,
  KnowledgeCase,
  MarketAnalysis,
} from "@/types";

const ORG = "org_1";
const now = "2026-07-14T09:00:00.000Z";

const audit = (createdBy = "user_admin") => ({
  organizationId: ORG,
  createdAt: now,
  updatedAt: now,
  createdBy,
  updatedBy: createdBy,
  deletedAt: null,
});

/* ---------------- 組織 ---------------- */
export const organizations: Organization[] = [
  { id: ORG, name: "株式会社グロースマーケティング", plan: "スタンダード", createdAt: now },
];

/* ---------------- ユーザー ---------------- */
export const users: User[] = [
  { id: "user_admin", name: "山田 太郎", email: "admin@example.com", role: "admin", title: "マネージャー", avatarColor: "#1A2B4A", active: true, ...audit() },
  { id: "user_sato", name: "佐藤 花子", email: "sato@example.com", role: "marketer", title: "シニアコンサルタント", avatarColor: "#C9A227", active: true, ...audit() },
  { id: "user_suzuki", name: "鈴木 健", email: "suzuki@example.com", role: "marketer", title: "コンサルタント", avatarColor: "#33507F", active: true, ...audit() },
  { id: "user_client", name: "田中 誠", email: "tanaka@sample-dining.example.com", role: "client", title: "株式会社サンプルダイニング 代表", avatarColor: "#0F766E", active: true, clientId: "client_1", ...audit() },
];

/* ---------------- クライアント ---------------- */
export const clients: Client[] = [
  {
    id: "client_1", name: "株式会社サンプルダイニング", representativeName: "田中 誠",
    contactName: "田中 誠", phone: "03-1234-5678", email: "info@sample-dining.example.com",
    address: "東京都渋谷区神南1-2-3", website: "https://sample-dining.example.com",
    contractStatus: "active", contractStartDate: "2026-01-15", contractEndDate: "2026-12-31",
    plan: "スタンダード", monthlyFee: 300000, consultantId: "user_sato",
    supportGoal: "6か月以内に月間売上400万円を達成する",
    currentIssues: "平日集客が弱く、SNS投稿が来店につながっていない。看板商品の認知も不足。",
    goal: "月間売上400万円 / リピート率35%", memo: "代表は数値管理に前向き。意思決定が速い。",
    ...audit("user_sato"),
  },
  {
    id: "client_2", name: "株式会社まちの食堂グループ", representativeName: "小林 大輔",
    contactName: "小林 大輔", phone: "06-9876-5432", email: "contact@machi-shokudo.example.com",
    address: "大阪府大阪市北区梅田2-4-6", website: "https://machi-shokudo.example.com",
    contractStatus: "active", contractStartDate: "2025-11-01", contractEndDate: "2026-10-31",
    plan: "プレミアム", monthlyFee: 500000, consultantId: "user_suzuki",
    supportGoal: "3店舗の売上を平均15%改善する", currentIssues: "店舗ごとに集客力の差が大きい。",
    goal: "全店平均客単価+10%", memo: "多店舗展開。横断的なノウハウ展開が鍵。",
    ...audit("user_suzuki"),
  },
  {
    id: "client_3", name: "有限会社海鮮堂", representativeName: "渡辺 誠一",
    contactName: "渡辺 由美", phone: "011-222-3333", email: "info@kaisendo.example.com",
    contractStatus: "negotiating", plan: "ライト", monthlyFee: 150000, consultantId: "user_sato",
    address: "北海道札幌市中央区南3条4丁目", supportGoal: "観光客の集客強化",
    currentIssues: "季節変動が大きい。閑散期の集客に課題。", goal: "閑散期売上の底上げ",
    memo: "商談中。提案書提出済み。", ...audit("user_sato"),
  },
];

/* ---------------- 店舗 ---------------- */
export const stores: Store[] = [
  {
    id: "store_hikari", clientId: "client_1", name: "カフェ＆ダイニング HIKARI",
    businessType: "カフェ・ダイニング", genre: "カフェ / イタリアン", address: "東京都渋谷区神南1-2-3 ヒカリビル1F",
    openingHours: "11:00-22:00", closedDays: "月曜", seats: 42, parkingLots: 0,
    avgSpend: 2000, monthlySales: 3000000, monthlyCustomers: 1500, employees: 8,
    takeout: true, delivery: false, reservationMethod: "電話 / Web / Instagram DM",
    mainCustomerSegment: "20-40代女性 / 近隣オフィスワーカー", tradeArea: "渋谷駅徒歩5分圏",
    managerName: "高橋 美咲",
    officialUrl: "https://hikari-cafe.example.com",
    googleBusinessUrl: "https://g.page/hikari-cafe",
    instagramUrl: "https://instagram.com/hikari_cafe",
    tiktokUrl: "https://tiktok.com/@hikari_cafe",
    lineUrl: "https://lin.ee/hikari", tabelogUrl: "https://tabelog.com/hikari",
    hotpepperUrl: "https://hotpepper.jp/hikari",
    supportStartDate: "2026-01-15", consultantId: "user_sato", phase: "施策実行",
    keyIssue: "平日ランチ・カフェタイムの集客", monthlyFocus: "看板商品を軸にしたInstagramリール",
    targetGoal: "月間売上400万円", nextMeetingDate: "2026-07-22",
    ...audit("user_sato"),
  },
  {
    id: "store_umeda", clientId: "client_2", name: "まちの食堂 梅田店",
    businessType: "定食・大衆食堂", genre: "和食", address: "大阪府大阪市北区梅田2-4-6",
    openingHours: "11:00-23:00", closedDays: "年中無休", seats: 60, parkingLots: 5,
    avgSpend: 1200, monthlySales: 4200000, monthlyCustomers: 3500, employees: 12,
    takeout: true, delivery: true, reservationMethod: "電話", mainCustomerSegment: "近隣勤務者・家族層",
    tradeArea: "梅田駅徒歩8分圏", managerName: "中村 剛",
    supportStartDate: "2025-11-01", consultantId: "user_suzuki", phase: "効果検証",
    keyIssue: "ディナー帯の客単価向上", monthlyFocus: "セットメニュー訴求",
    targetGoal: "客単価1,400円", nextMeetingDate: "2026-07-18", ...audit("user_suzuki"),
  },
  {
    id: "store_namba", clientId: "client_2", name: "まちの食堂 難波店",
    businessType: "定食・大衆食堂", genre: "和食", address: "大阪府大阪市中央区難波1-1-1",
    openingHours: "11:00-22:00", closedDays: "年中無休", seats: 48, parkingLots: 0,
    avgSpend: 1100, monthlySales: 2800000, monthlyCustomers: 2500, employees: 9,
    takeout: true, delivery: true, reservationMethod: "電話", mainCustomerSegment: "観光客・若年層",
    tradeArea: "難波駅徒歩3分圏", managerName: "伊藤 香",
    supportStartDate: "2025-11-01", consultantId: "user_suzuki", phase: "現状分析",
    keyIssue: "観光客の取り込み", monthlyFocus: "多言語メニュー・MEO強化",
    targetGoal: "月間客数3,000人", nextMeetingDate: "2026-07-25", ...audit("user_suzuki"),
  },
];

/* ---------------- 初回ヒアリング ---------------- */
export const hearings: Hearing[] = [
  {
    id: "hearing_hikari", storeId: "store_hikari", status: "completed",
    fields: {
      background: "オーナーが北欧留学中に出会ったカフェ文化を、地域に根ざした形で提供したいと開業。",
      philosophy: "「日常に光を灯す」— 気取らず質の高い時間を提供する。",
      vision: "渋谷で最も居心地の良い、地域に愛されるカフェになる。",
      products: "自家焙煎コーヒー、季節のパスタ、自家製スイーツ。",
      flagship: "北欧風シナモンロールと季節のフルーツパフェ。",
      highMarginProduct: "ドリンク・スイーツのセット。",
      idealCustomer: "落ち着いた時間を求める20-40代女性、近隣で働くビジネス層。",
      currentCustomer: "近隣オフィスワーカー中心。週末は女性グループ。",
      visitMotive: "作業・打ち合わせ、女子会、ちょっと贅沢なランチ。",
      visitFrequency: "リピーターは月2-3回。新規は口コミ・Instagram経由。",
      currentChannels: "Instagram、食べログ、Googleマップ、通りがかり。",
      acquisitionPain: "平日昼〜夕方の集客が弱い。SNSのフォロワーは多いが来店に結びつかない。",
      salesPain: "客単価が伸び悩んでいる。単品注文が多い。",
      operationPain: "ピーク時の提供スピードにばらつき。",
      hrPain: "アルバイトの接客品質に差がある。",
      competitors: "近隣チェーンカフェ、個人経営の人気カフェ2店。",
      strengths: "コーヒーの品質、居心地の良い内装、写真映えするスイーツ。",
      weaknesses: "看板商品の認知不足、平日昼の弱さ、単価の低さ。",
      pastInitiatives: "食べログ有料プラン、Instagram運用（自社）。",
      successInitiatives: "季節限定パフェの投稿がバズり週末に行列。",
      failedInitiatives: "チラシ配布は反応が薄かった。",
      salesTarget: "月間売上400万円。",
      deadline: "2026年内（6か月以内）。",
      budget: "月30万円程度（コンサル費含む）。",
      resource: "店長＋アルバイト2名でSNS対応可能。撮影は週1回程度。",
    },
    ...audit("user_sato"),
  },
];

/* ---------------- 店舗診断 ---------------- */
// カテゴリごとの評価傾向（5段階）でスコアを生成する
const SCORE_PATTERN: Record<string, number[]> = {
  product: [4, 4, 5, 3, 3, 3, 2, 3, 4, 4],
  service: [4, 4, 3, 3, 3, 4, 3, 4, 2, 3],
  atmosphere: [4, 4, 5, 4, 4, 3, 4, 4, 4, 5],
  image: [3, 3, 3, 4, 2, 3, 4, 3, 2, 4],
  experience: [4, 3, 4, 3, 4, 3, 4, 5, 3, 2],
};

function buildScores(pattern: Record<string, number[]>): DiagnosisScore[] {
  const result: DiagnosisScore[] = [];
  for (const cat of DIAGNOSIS_CATEGORIES) {
    const scores = pattern[cat.key] ?? [];
    cat.items.forEach((item, i) => {
      const score = scores[i] ?? 3;
      result.push({
        itemLabel: item,
        categoryKey: cat.key,
        score,
        comment: score <= 2 ? "要改善ポイント。次回施策で重点対応。" : undefined,
        improvement: score <= 2 ? "具体施策を戦略に反映する。" : undefined,
        priority: score <= 2 ? "high" : score === 3 ? "medium" : "low",
      });
    });
  }
  return result;
}

export const diagnoses: Diagnosis[] = [
  {
    id: "diag_hikari_2", storeId: "store_hikari", date: "2026-06-10", evaluatorId: "user_sato",
    scores: buildScores(SCORE_PATTERN),
    summary: "雰囲気・商品価値は高水準。イメージ価値（看板商品の認知）と接客の均一性、客単価に直結する体験設計が課題。",
    ...audit("user_sato"),
  },
  {
    id: "diag_hikari_1", storeId: "store_hikari", date: "2026-02-05", evaluatorId: "user_sato",
    scores: buildScores({
      product: [3, 4, 4, 3, 3, 2, 2, 2, 3, 3],
      service: [3, 3, 3, 2, 3, 3, 3, 4, 2, 2],
      atmosphere: [4, 4, 4, 4, 4, 3, 3, 4, 4, 4],
      image: [3, 3, 2, 3, 2, 3, 3, 2, 2, 3],
      experience: [3, 3, 3, 3, 3, 3, 3, 4, 2, 2],
    }),
    summary: "初回診断。全体的に伸びしろが大きい。特にイメージ価値と体験価値の設計が手つかず。",
    ...audit("user_sato"),
  },
];

/* ---------------- 市場分析 ---------------- */
export const marketAnalyses: MarketAnalysis[] = [
  {
    id: "market_hikari", storeId: "store_hikari",
    marketSize: "渋谷エリアのカフェ市場は年間約XX億円規模。競争は激しいが需要も安定。",
    marketGrowth: "スペシャルティコーヒー・作業カフェ需要は微増傾向。",
    trends: "「映え」から「居心地・体験」重視へ。リモートワーク需要も継続。",
    customerNeeds: "落ち着ける空間、質の高いコーヒー、写真映えする限定メニュー。",
    opportunities: "平日日中の作業需要、法人利用、地域コミュニティ形成。",
    threats: "大手チェーンの新規出店、原材料・人件費の高騰。",
    ...audit("user_sato"),
  },
];

/* ---------------- 競合 ---------------- */
export const competitors: Competitor[] = [
  { id: "comp_1", storeId: "store_hikari", name: "チェーンカフェA 渋谷店", url: "https://example.com/a", distanceKm: 0.3, businessType: "チェーンカフェ", target: "幅広い層", priceRange: "¥500-1,200", avgSpend: 800, signatureProduct: "定番ラテ", strengths: "低価格・回転率・認知度", weaknesses: "画一的で特別感がない", googleRating: 3.8, reviewCount: 420, snsFollowers: 1200, postFrequency: "週2", threatLevel: 2, ...audit("user_sato") },
  { id: "comp_2", storeId: "store_hikari", name: "個人カフェ Lumiere", url: "https://example.com/b", distanceKm: 0.5, businessType: "個人カフェ", target: "20-30代女性", priceRange: "¥1,500-2,500", avgSpend: 2200, signatureProduct: "季節のタルト", strengths: "世界観・SNS運用が上手い", weaknesses: "席数が少なく待ち時間", googleRating: 4.4, reviewCount: 260, snsFollowers: 8500, postFrequency: "週4", threatLevel: 3, ...audit("user_sato") },
  { id: "comp_3", storeId: "store_hikari", name: "ダイニングBar Sora", distanceKm: 0.7, businessType: "ダイニングバー", target: "30-40代", priceRange: "¥2,000-4,000", avgSpend: 3200, signatureProduct: "夜のコース", strengths: "夜間の集客力", weaknesses: "昼は営業していない", googleRating: 4.0, reviewCount: 150, snsFollowers: 3000, postFrequency: "週1", threatLevel: 1, ...audit("user_sato") },
];

/* ---------------- 課題 ---------------- */
export const issues: Issue[] = [
  { id: "issue_1", storeId: "store_hikari", title: "平日昼〜夕方の集客が弱い", category: "集客", detail: "平日13-17時の来店が少なく、席稼働率が低い。", basis: "KPI: 平日客数が週末の40%。診断: 体験価値の平日訴求不足。", impact: 3, urgency: 3, difficulty: 2, status: "in_progress", assigneeId: "user_sato", foundDate: "2026-02-05", dueDate: "2026-08-31", relatedKpi: "customers", ...audit("user_sato") },
  { id: "issue_2", storeId: "store_hikari", title: "Instagram投稿が来店につながっていない", category: "集客", detail: "フォロワー2,500人に対し、Instagram経由予約が月10件未満。", basis: "KPI: IG経由予約が伸びていない。導線（プロフィール・予約リンク）が弱い。", impact: 3, urgency: 2, difficulty: 2, status: "in_progress", assigneeId: "user_sato", foundDate: "2026-02-05", dueDate: "2026-07-31", relatedKpi: "ig_reservations", ...audit("user_sato") },
  { id: "issue_3", storeId: "store_hikari", title: "看板商品が認知されていない", category: "ブランディング", detail: "シナモンロールという強みが顧客に伝わっていない。", basis: "診断: イメージ価値『看板商品の有無』が低評価。", impact: 3, urgency: 2, difficulty: 2, status: "open", assigneeId: "user_sato", foundDate: "2026-06-10", dueDate: "2026-09-30", relatedKpi: "new_customers", ...audit("user_sato") },
  { id: "issue_4", storeId: "store_hikari", title: "LINE登録後の再来店施策がない", category: "リピート", detail: "友だち800人に対し、再来店を促す配信設計がない。", basis: "KPI: LINE経由予約が僅少。配信頻度も低い。", impact: 2, urgency: 2, difficulty: 1, status: "open", assigneeId: "user_suzuki", foundDate: "2026-06-10", dueDate: "2026-08-15", relatedKpi: "line_reservations", ...audit("user_sato") },
  { id: "issue_5", storeId: "store_hikari", title: "客単価を上げるメニュー設計が不足", category: "客単価", detail: "単品注文が多くセット・追加注文が弱い。", basis: "KPI: 注文点数が低い。診断: 体験価値の注文体験が中程度。", impact: 2, urgency: 2, difficulty: 2, status: "open", assigneeId: "user_sato", foundDate: "2026-06-10", dueDate: "2026-09-15", relatedKpi: "avg_spend", ...audit("user_sato") },
];

/* ---------------- 戦略 ---------------- */
export const strategies: Strategy[] = [
  {
    id: "strategy_hikari", storeId: "store_hikari",
    goal: "6か月で月間売上400万円（客単価+15%、平日客数+30%）",
    theme: "『渋谷で最も居心地の良い一杯』を軸にした平日需要とリピートの最大化",
    target: "近隣で働く20-40代、落ち着いた時間と質を求める層",
    positioning: "チェーンの手軽さと高級カフェの特別感の中間。日常に使える上質。",
    reasonChosen: "コーヒーの品質と空間という既存の強みを、看板商品と体験設計で言語化・可視化する。",
    centerPin: "看板商品『北欧シナモンロール』の認知確立 → 平日カフェタイムの来店動機化",
    keyIssues: "平日集客 / SNS導線 / 看板商品認知 / LINEリピート / 客単価",
    period: "2026-07 〜 2026-12", budget: 1200000, assigneeId: "user_sato",
    acquisitionTactics: "看板商品リール / MEO口コミ強化 / 平日限定セット訴求 / 地域連携",
    salesTactics: "セットメニュー設計 / 高単価スイーツ / LINE再来店クーポン / 滞在時間の追加注文導線",
    ...audit("user_sato"),
  },
];

/* ---------------- KPI（6か月分） ---------------- */
const MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
// [key, category, unit不要, 各月実績, 目標]
const KPI_SERIES: Array<{ key: string; category: KpiRecord["category"]; actual: number[]; target: number }> = [
  { key: "sales", category: "sales", actual: [2800000, 2750000, 2900000, 2950000, 3000000, 3100000], target: 4000000 },
  { key: "customers", category: "sales", actual: [1420, 1380, 1450, 1470, 1500, 1540], target: 1800 },
  { key: "avg_spend", category: "sales", actual: [1972, 1993, 2000, 2007, 2000, 2013], target: 2300 },
  { key: "new_customers", category: "sales", actual: [520, 480, 540, 560, 600, 640], target: 700 },
  { key: "repeat_rate", category: "sales", actual: [20, 21, 22, 23, 24, 25], target: 35 },
  { key: "review_count", category: "meo", actual: [92, 98, 104, 110, 116, 120], target: 150 },
  { key: "review_rating", category: "meo", actual: [3.9, 3.9, 4.0, 4.0, 4.1, 4.1], target: 4.4 },
  { key: "ig_followers", category: "instagram", actual: [1800, 1950, 2100, 2250, 2380, 2500], target: 4000 },
  { key: "ig_reservations", category: "instagram", actual: [6, 7, 8, 9, 11, 14], target: 40 },
  { key: "line_friends", category: "line", actual: [500, 560, 620, 690, 750, 800], target: 1500 },
];

export const kpiRecords: KpiRecord[] = KPI_SERIES.flatMap((series) =>
  MONTHS.map((month, i) => ({
    id: `kpi_${series.key}_${month}`,
    storeId: "store_hikari",
    month,
    category: series.category,
    kpiKey: series.key,
    actual: series.actual[i] ?? null,
    target: series.target,
    ...audit("user_sato"),
  }))
);

/* ---------------- 施策 ---------------- */
export const initiatives: Initiative[] = [
  { id: "init_1", storeId: "store_hikari", name: "平日限定ランチセットの訴求", category: "メニュー改善", purpose: "平日昼の集客と客単価向上", targetCustomer: "近隣オフィスワーカー", hypothesis: "お得感のあるセットで平日昼の来店動機を作れる", content: "パスタ+ドリンク+ミニスイーツの平日限定セットを設計し店頭・SNSで訴求", channel: "店頭 / Instagram / Google", startDate: "2026-07-01", endDate: "2026-09-30", budget: 80000, assigneeId: "user_sato", kpiKey: "customers", targetValue: 1650, actualValue: 1540, status: "in_progress", ...audit("user_sato") },
  { id: "init_2", storeId: "store_hikari", name: "看板商品リール（シナモンロール）", category: "Instagram", purpose: "看板商品の認知確立", targetCustomer: "20-40代女性", hypothesis: "調理・実食のリールで『あの店の名物』を想起させられる", content: "週2本のリール制作。焼き上げ〜実食の没入型コンテンツ。", channel: "Instagram / TikTok", startDate: "2026-07-01", endDate: "2026-08-31", budget: 60000, assigneeId: "user_sato", kpiKey: "ig_reservations", targetValue: 25, actualValue: 14, status: "in_progress", ...audit("user_sato") },
  { id: "init_3", storeId: "store_hikari", name: "Google口コミ獲得施策", category: "Google・MEO", purpose: "MEO順位と信頼性の向上", targetCustomer: "検索来店層", hypothesis: "会計時のQR案内で口コミ数と評価を伸ばせる", content: "会計時カード・レシートQR・スタッフ声かけの標準化。", channel: "店頭 / Google", startDate: "2026-06-15", endDate: "2026-09-30", budget: 20000, assigneeId: "user_suzuki", kpiKey: "review_count", targetValue: 150, actualValue: 120, status: "in_progress", ...audit("user_sato") },
  { id: "init_4", storeId: "store_hikari", name: "LINE来店後クーポン", category: "LINE", purpose: "再来店率の向上", targetCustomer: "既存来店客", hypothesis: "来店直後の登録誘導と次回クーポンで再訪を促せる", content: "来店時LINE登録→翌週有効の割引配信、誕生月特典。", channel: "LINE / 店頭", startDate: "2026-07-10", endDate: "2026-12-31", budget: 30000, assigneeId: "user_suzuki", kpiKey: "repeat_rate", targetValue: 30, actualValue: 25, status: "planned", ...audit("user_sato") },
  { id: "init_5", storeId: "store_hikari", name: "セットメニューの改善", category: "客単価向上", purpose: "客単価と注文点数の向上", targetCustomer: "全来店客", hypothesis: "魅力的なセット設計で+1品を自然に促せる", content: "ドリンク・スイーツセットの再設計、メニュー表の見せ方改善。", channel: "店頭 / メニュー", startDate: "2026-08-01", endDate: "2026-10-31", budget: 40000, assigneeId: "user_sato", kpiKey: "avg_spend", targetValue: 2300, actualValue: 2013, status: "planned", ...audit("user_sato") },
];

/* ---------------- SNSコンテンツ ---------------- */
export const socialContents: SocialContent[] = [
  { id: "sns_1", storeId: "store_hikari", platform: "Instagram", theme: "看板シナモンロールの焼き上げリール", purpose: "看板商品認知", target: "20-40代女性", format: "リール", title: "毎朝焼き上げる、渋谷の秘密のシナモンロール", caption: "香りまで届けたい。#渋谷カフェ #シナモンロール", script: "①焼き上げの湯気 ②断面 ③実食リアクション ④店内の雰囲気", assigneeId: "user_sato", shootDate: "2026-07-16", postDate: "2026-07-18", status: "editing", ...audit("user_sato") },
  { id: "sns_2", storeId: "store_hikari", platform: "Instagram", theme: "平日限定ランチセット紹介", purpose: "平日集客", target: "近隣ワーカー", format: "フィード", title: "平日だけの贅沢ランチ", caption: "平日11-15時限定。#渋谷ランチ", assigneeId: "user_sato", postDate: "2026-07-20", status: "review", ...audit("user_sato") },
  { id: "sns_3", storeId: "store_hikari", platform: "TikTok", theme: "季節のパフェ制作", purpose: "新規リーチ", target: "若年層", format: "ショート動画", title: "夏の限定パフェができるまで", assigneeId: "user_suzuki", status: "planning", ...audit("user_sato") },
];

/* ---------------- タスク ---------------- */
export const tasks: Task[] = [
  { id: "task_1", title: "シナモンロールリールの撮影", detail: "焼き上げ〜実食の素材を撮影", assigneeId: "user_sato", dueDate: "2026-07-16", priority: "high", status: "in_progress", clientId: "client_1", storeId: "store_hikari", initiativeId: "init_2", checklist: [{ label: "台本確認", done: true }, { label: "撮影機材準備", done: true }, { label: "撮影", done: false }, { label: "編集", done: false }], ...audit("user_sato") },
  { id: "task_2", title: "平日ランチセットのメニュー表作成", assigneeId: "user_sato", dueDate: "2026-07-10", priority: "high", status: "review", clientId: "client_1", storeId: "store_hikari", initiativeId: "init_1", ...audit("user_sato") },
  { id: "task_3", title: "Google口コミQRカードの設置", assigneeId: "user_suzuki", dueDate: "2026-07-05", priority: "medium", status: "todo", clientId: "client_1", storeId: "store_hikari", initiativeId: "init_3", ...audit("user_sato") },
  { id: "task_4", title: "6月度 月次レポートの作成", assigneeId: "user_sato", dueDate: "2026-07-08", priority: "high", status: "in_progress", clientId: "client_1", storeId: "store_hikari", ...audit("user_sato") },
  { id: "task_5", title: "LINEクーポン配信設計", assigneeId: "user_suzuki", dueDate: "2026-07-20", priority: "medium", status: "todo", clientId: "client_1", storeId: "store_hikari", initiativeId: "init_4", ...audit("user_sato") },
  { id: "task_6", title: "梅田店 セットメニュー効果測定", assigneeId: "user_suzuki", dueDate: "2026-07-12", priority: "medium", status: "in_progress", clientId: "client_2", storeId: "store_umeda", ...audit("user_suzuki") },
  { id: "task_7", title: "難波店 競合調査", assigneeId: "user_suzuki", dueDate: "2026-07-28", priority: "low", status: "todo", clientId: "client_2", storeId: "store_namba", ...audit("user_suzuki") },
];

/* ---------------- ミーティング ---------------- */
export const meetings: Meeting[] = [
  { id: "meet_1", clientId: "client_1", storeId: "store_hikari", datetime: "2026-06-22T14:00:00.000Z", attendees: "田中代表 / 高橋店長 / 佐藤", agenda: "6月度の振り返りと7月施策", minutes: "看板商品リールの方向性を合意。平日セットの価格帯を1,280円で決定。", decisions: "シナモンロールを看板商品として全面訴求", nextDate: "2026-07-22", actions: ["リール台本作成", "セットメニュー原価計算", "口コミQR設置"], ...audit("user_sato") },
  { id: "meet_2", clientId: "client_1", storeId: "store_hikari", datetime: "2026-05-20T14:00:00.000Z", attendees: "田中代表 / 佐藤", agenda: "5月度KPIレビュー", minutes: "Instagram経由予約が微増。導線改善の必要性を確認。", decisions: "プロフィールに予約リンク追加", nextDate: "2026-06-22", actions: ["プロフィール改善"], ...audit("user_sato") },
];

/* ---------------- 月次レポート ---------------- */
export const monthlyReports: MonthlyReport[] = [
  {
    id: "report_hikari_06", storeId: "store_hikari", month: "2026-06", status: "approved",
    sections: {
      "今月の総括": "売上は前月比+3.3%の310万円。看板商品施策の準備が進み、口コミ数・IGフォロワーが着実に増加。平日集客は引き続き課題。",
      "KPIサマリー": "売上310万 / 客数1,540 / 客単価2,013円 / リピート率25% / IGフォロワー2,500 / 口コミ120件(4.1)。",
      "集客チャネル別の成果": "Google検索経由が最も多く、次いでInstagram。LINE経由はまだ限定的。",
      "実施施策": "Google口コミ獲得施策、看板商品リールの制作準備、平日セット設計。",
      "施策ごとの成果": "口コミは月+4件で目標ペース。IG経由予約は11→14件へ改善。",
      "良かった点": "口コミ評価が4.1へ上昇。スイーツ投稿の保存数が増加。",
      "課題": "平日昼の稼働率が依然低い。客単価が目標に未達。",
      "改善案": "平日限定セットの訴求強化と、看板商品リールの本格展開。",
      "来月の重点施策": "シナモンロールリール週2本、平日ランチセット本稼働、LINE再来店クーポン開始。",
      "来月のKPI目標": "売上330万 / 客数1,650 / IG経由予約20件 / リピート率27%。",
      "クライアントへの依頼事項": "撮影用の営業前30分の確保、スタッフの口コミ声かけ徹底。",
    },
    ...audit("user_sato"),
  },
];

/* ---------------- ナレッジ ---------------- */
export const knowledgeCases: KnowledgeCase[] = [
  { id: "know_1", title: "看板商品リールで平日昼の集客を1.4倍に", businessType: "カフェ", storeScale: "40席前後", region: "都市部", avgSpend: 1800, issue: "平日昼の集客が弱い", initiative: "看板商品の調理〜実食リールを週2本投稿", channels: ["Instagram", "TikTok"], period: "3か月", beforeMetrics: "平日昼客数 平均25人/日", afterMetrics: "平日昼客数 平均35人/日", result: "平日昼客数+40%、IG経由予約3倍", successFactors: "商品を一つに絞り一貫して訴求。実食のリアクションを重視。", reproConditions: "明確な看板商品があること。週2本の継続。", tags: ["リール", "看板商品", "平日集客", "カフェ"], ...audit("user_sato") },
  { id: "know_2", title: "会計時QRでGoogle口コミを月+30件", businessType: "飲食全般", storeScale: "問わず", region: "全国", issue: "口コミ数が少なくMEOが弱い", initiative: "会計時のQRカード＋スタッフ声かけの標準化", channels: ["Google・MEO"], period: "2か月", beforeMetrics: "口コミ 月+3件", afterMetrics: "口コミ 月+30件", result: "MEO表示回数+50%、評価4.0→4.3", successFactors: "オペレーションに組み込み属人化を排除。", reproConditions: "会計時の声かけを徹底できること。", tags: ["MEO", "口コミ", "オペレーション"], ...audit("user_suzuki") },
];
