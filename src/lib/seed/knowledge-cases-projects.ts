import type { CaseStudy, KnowledgeArticle, Meeting, Project, Source, Person } from "@/lib/types";
import { base, ABENGERS_ORG, KOENI_ORG } from "./helpers";

// --- ノウハウライブラリ(要件 8-9) ---------------------------------
export const knowledgeArticles: KnowledgeArticle[] = [
  {
    ...base({ id: "kn-fc-centerpin", confidenceLevel: "A", certaintyLevel: "confirmed" }),
    title: "FC本部構築のセンターピンは「加盟店の投資回収可能性」",
    category: "FC本部構築",
    summary: "FC展開の成否は本部の売上ではなく、加盟店が投資を回収できるかで決まる。",
    conclusion: "加盟店の投資回収モデルが検証されるまで、加盟開発を加速してはならない。",
    background:
      "ベンチャー・リンク事例では、未検証モデルの販売と加盟金の先行回収が加盟店の収益性を破壊し、訴訟とブランド失墜を招いた。",
    principles: "本部の短期KPIと加盟店の長期LTVは利益相反しやすい。この相反を制度で抑える。",
    practice:
      "## 実践手順\n1. 直営でユニットエコノミクスを検証\n2. 加盟店の投資回収期間を明示\n3. 品質管理体制を整えてから加盟開発\n4. 本部KPIに加盟店収益性を組み込む",
    successExample: "牛角・サンマルク等の仕組み化による全国展開(要確認)。",
    failureExample: "未出店案件・加盟店訴訟(ベンチャー・リンク)。",
    cautions: "「絶対に儲かる」という表現を用いない。情報の非対称性を作らない。",
    checklist: ["直営で黒字化を実証したか", "加盟店の投資回収期間を提示したか", "品質管理体制はあるか"],
    relatedCompanyIds: ["co-venturelink", "co-abengers"],
    relatedCaseIds: ["case-vl-collapse"],
    importance: "high",
    abengersUsage: "FC本部代行・加盟開発の提案時に必ず投資回収モデルを提示する。",
    koeniUsage: "加盟募集のマーケティングで誇大表現を避け、実データで訴求する。",
    tags: ["FC", "センターピン", "教訓"],
  },
  {
    ...base({ id: "kn-abengers-diff", confidenceLevel: "A", certaintyLevel: "confirmed" }),
    title: "ABENGERSと各支援モデルの違いの説明ロジック",
    category: "経営戦略",
    summary: "営業時に、コンサル・VC・CXO派遣との違いを一言で説明するためのロジック。",
    conclusion:
      "ABENGERSは「経営・実行・人材・資金を分断せず一体で担い、成果と利益を顧客と共有する共同経営」である点が唯一の差別化。",
    practice:
      "- コンサル: 助言まで / ABENGERS: 経営実行まで\n- VC: 出資と支援 / ABENGERS: 出資 + 日常経営 + マーケ実行\n- CXO派遣: 人材個人 / ABENGERS: 会社として経営責任",
    relatedCompanyIds: ["co-abengers"],
    importance: "high",
    abengersUsage: "初回商談の標準トーク。",
    tags: ["営業", "差別化"],
  },
  {
    ...base({ id: "kn-restaurant-kpi", confidenceLevel: "B", certaintyLevel: "strong", organizationId: KOENI_ORG }),
    title: "月商1,000万円の飲食店で最初に確認すべきKPI",
    category: "PL管理",
    summary: "飲食店の健全性を見る初期KPIセット。",
    conclusion: "FL比率・客単価×客数・リピート率・人時売上高をまず確認する。",
    practice:
      "- FL比率(原価+人件費 / 売上)60%以下\n- 客単価 × 客数の分解\n- 新規/リピート比率\n- 人時売上高\n- 席数回転率",
    checklist: ["FL比率", "客単価", "客数", "リピート率", "人時売上高"],
    importance: "medium",
    koeniUsage: "飲食クライアントの初回診断チェックリスト。",
    tags: ["飲食", "KPI", "PL"],
  },
];

// --- 成功・失敗事例(要件 8-10) -------------------------------------
export const caseStudies: CaseStudy[] = [
  {
    ...base({ id: "case-vl-collapse", confidenceLevel: "B", certaintyLevel: "strong" }),
    title: "ベンチャー・リンク:急拡大FCモデルの崩壊",
    companyName: "ベンチャー・リンク",
    companyId: "co-venturelink",
    industry: "FC / 外食",
    kind: "failure",
    situation: "1990年代後半〜2000年代、FC加盟開発を高速で拡大。",
    goal: "加盟開発と本部売上の最大化、FC本部の株式公開・売却益。",
    actions: "中小企業ネットワークへの加盟開発、加盟金先行回収、数値管理の徹底。",
    result: "加盟店の収益性悪化、未出店案件、加盟店との訴訟、ブランド信頼の失墜。",
    failureFactors: ["未完成モデルの販売", "加盟店収益性の軽視", "短期売上KPIの暴走", "品質管理前の急拡大"],
    overlookedAssumptions: ["加盟店が必ず投資回収できるという前提が未検証だった"],
    warningSigns: ["未出店案件の増加", "加盟店クレームの増加"],
    earlyIndicators: ["加盟店の黒字化率低下", "解約・訴訟の発生率"],
    preventionMeasures: ["直営での事業モデル検証", "本部KPIへの加盟店収益性の組込み", "誇大表現の禁止"],
    abengersImplication: "拡大の前に、加盟店の投資回収可能性を検証・保証する制度を持つ。",
    koeniImplication: "加盟募集広告で誇大な収益表現を用いない。",
    relatedKnowledgeIds: ["kn-fc-centerpin"],
    sources: ["業界文献(要確認)"],
    tags: ["FC", "失敗", "教訓"],
  },
  {
    ...base({ id: "case-koeni-lp", confidenceLevel: "A", certaintyLevel: "confirmed", organizationId: KOENI_ORG }),
    title: "コエニ:LP改善でCVR2.1倍(社内実績・仮名)",
    companyName: "コエニ",
    projectName: "D2C美容ブランド支援",
    industry: "D2C / 美容",
    kind: "success",
    situation: "広告費は投下できているが、LPのCVRが低く赤字。",
    goal: "CVR改善による黒字化。",
    actions: "ファーストビューの提供価値明確化、社会的証明の追加、フォーム最適化。",
    result: "CVRが1.2%→2.5%へ改善、CPA46%削減。",
    metrics: "CVR +108%, CPA -46%",
    successFactors: ["提供価値の言語化", "検証サイクルの高速化"],
    koeniImplication: "提供価値の言語化はコエニの標準工程として横展開する。",
    tags: ["マーケ", "成功", "CVR"],
  },
];

// --- 社内プロジェクト(要件 8-11) -----------------------------------
export const projects: Project[] = [
  {
    ...base({ id: "prj-fc-cafe", visibility: "project_members", confidenceLevel: "A", certaintyLevel: "confirmed" }),
    name: "地方カフェのFC本部構築",
    clientName: "(仮名)Cafe Verde",
    belongingCompany: "ABENGERS",
    industry: "外食 / カフェ",
    projectType: "FC本部構築 + 共同経営",
    supportPhase: "本部構築フェーズ",
    leadId: "user-approver",
    memberIds: ["user-approver", "user-editor"],
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    projectStatus: "進行中",
    background: "地方で繁盛する1店舗をFC化して全国展開したい。",
    customerProblem: "属人的な運営で仕組み化・多店舗展開ができていない。",
    goal: "直営2号店で再現性を検証後、FC本部を構築する。",
    kpis: [
      { label: "直営2号店 営業利益率", target: "15%", current: "11%" },
      { label: "オペレーションマニュアル整備率", target: "100%", current: "60%" },
    ],
    supportContent: "事業因数分解、標準化、CXO派遣、加盟開発設計。",
    decisions: ["加盟開発は2号店の黒字化検証後に開始する"],
    result: "2号店オープン、黒字化検証中。",
    currentIssues: "人材採用の遅れ。",
    reusableKnowledgeIds: ["kn-fc-centerpin"],
    relatedCompanyIds: ["co-venturelink", "co-abengers"],
    tags: ["FC", "外食", "進行中"],
  },
];

// --- 会議記録(要件 8-12) -------------------------------------------
export const meetings: Meeting[] = [
  {
    ...base({ id: "mtg-fc-kickoff", visibility: "project_members", confidenceLevel: "A", certaintyLevel: "confirmed" }),
    title: "Cafe Verde FC本部構築 キックオフ",
    heldAt: "2026-04-03T10:00:00Z",
    participants: ["堀 健一", "承認 太郎", "編集 花子"],
    projectId: "prj-fc-cafe",
    agenda: "FC化方針とマイルストーンの確認",
    minutes: "直営2号店での再現性検証を最優先とすることで合意。",
    decisions: [
      {
        id: "dec-1",
        content: "加盟開発は2号店黒字化の検証後に開始する",
        reason: "ベンチャー・リンクの失敗(未検証モデルの販売)を回避するため",
        rejectedAlternatives: "先行して加盟開発を進める案(却下)",
        assumptions: "2号店が6ヶ月以内に黒字化する前提",
      },
    ],
    actionItems: [
      { id: "ai-1", content: "オペレーションマニュアル整備", owner: "編集 花子", dueDate: "2026-08-31", done: false },
    ],
    nextReviewDate: "2026-07-31",
    relatedCompanyIds: ["co-abengers"],
    aiSummary: "2号店の黒字化検証を最優先とし、加盟開発は検証後に開始する方針で合意。",
    tags: ["FC", "会議"],
  },
];

// --- 情報ソース(要件 8-16) -----------------------------------------
export const sources: Source[] = [
  {
    ...base({ id: "src-igpi", confidenceLevel: "A", certaintyLevel: "confirmed" }),
    name: "経営共創基盤 公式サイト",
    url: "https://www.igpi.co.jp/",
    sourceType: "企業公式サイト",
    targetCompanyId: "co-igpi",
    updateFrequency: "月次",
    lastFetchedAt: "2026-06-20",
    nextFetchAt: "2026-07-20",
    autoFetch: false,
    owner: "編集 花子",
  },
];

// --- 人物図鑑(要件 8-6) --------------------------------------------
export const people: Person[] = [
  {
    ...base({ id: "person-hori", confidenceLevel: "A", certaintyLevel: "confirmed", organizationId: ABENGERS_ORG }),
    name: "堀 健一",
    companyId: "co-abengers",
    companyName: "ABENGERS",
    title: "代表取締役",
    philosophy: "顧客と利益を共有する共同経営でこそ、事業創造は継続的に成立する。",
    strengths: ["事業構想", "経営受託", "人材育成"],
    abengersLearnings: ["自社モデルの言語化と標準化"],
    tags: ["自社", "経営者"],
  },
];
