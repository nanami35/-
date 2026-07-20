import type { Company } from "@/lib/types";
import { base, ABENGERS_ORG, KOENI_ORG } from "./helpers";

// =====================================================================
// 企業図鑑シード(要件 8-5 / 17)
// ABENGERS・コエニ・ベンチャーリンクは指示書の定義を反映。
// その他の企業は未検証内容を断定せず「要確認/仮説」で登録(要件17)。
// =====================================================================

export const companies: Company[] = [
  // --- ABENGERS(自社。指示書 第4章の定義を反映) --------------------
  {
    ...base({ id: "co-abengers", organizationId: ABENGERS_ORG, confidenceLevel: "A", certaintyLevel: "confirmed" }),
    name: "ABENGERS",
    nameKana: "アベンジャーズ",
    logoText: "AB",
    category: "abengers",
    industry: "共同経営型 事業創造",
    representative: "堀 健一",
    location: "東京",
    tags: ["自社", "共同経営", "事業創造"],
    businessModel: {
      targetCustomer: "価値ある事業を構想・成長させたい経営者・企業",
      customerProblem: "構想はあるが、経営・実行・人材・資金を一体で担える相手がいない",
      valueProposition:
        "事業の構想、経営、実行、人材、マーケティング、FC化、出資までを一体で担う、共同経営型の事業創造",
      products:
        "経営戦略策定 / 事業計画策定 / 経営受託 / 事業責任者・CXO派遣 / マーケティング支援 / 採用支援 / 人材育成 / 組織構築 / FC本部構築・代行 / 加盟開発 / 共同経営 / 出資 / グループ会社化 / 事業の連続創出",
      revenueModel: "顧問・受託 + 成果報酬 + 出資による株式価値・EXIT収益",
      competitiveEdge: "経営・実行・人材・資金を分断せず一体で担い、顧客と利益を共有する共同経営モデル",
      managementScope: "経営全体(戦略〜現場実行〜人材〜資金)",
      hasInvestment: true,
      hasStaffing: true,
      hasPerformanceFee: true,
      hasExit: true,
    },
    analysis: {
      centerPin: "共同経営者として事業成果に責任を持ち、成果と利益を顧客と共有すること",
      strengths: ["事業の因数分解", "経営受託力", "CXO人材", "FC本部構築", "出資と支援の統合"],
      kpis: ["支援先の事業成長率", "内製化達成率", "連続創出した事業数", "株式価値向上"],
      outlook: "グループ会社化と事業の連続創出により、事業ポートフォリオを継続拡大",
    },
    application: {
      abengersLearnings: ["自社モデルの言語化と標準化を継続する"],
      diffFromKoeni: "ABENGERSは経営・事業全体を担い、コエニは顧客獲得・販売・マーケティング実行を担う",
    },
  },

  // --- コエニ(グループ企業。指示書 第4章の定義を反映) ---------------
  {
    ...base({ id: "co-koeni", organizationId: KOENI_ORG, confidenceLevel: "A", certaintyLevel: "confirmed" }),
    name: "コエニ",
    nameKana: "コエニ",
    logoText: "KO",
    category: "marketing",
    industry: "マーケティング実行",
    location: "東京",
    tags: ["グループ会社", "マーケティング実行"],
    businessModel: {
      targetCustomer: "価値ある商品・サービスを持ち、売上へ変えたい事業者",
      customerProblem: "良い商品はあるが、必要とする人へ届けて売上に変える実行力が足りない",
      valueProposition: "価値ある商品・サービスを、必要とする人へ届け、売上へ変えるマーケティング実行",
      products: "顧客獲得 / 販売 / 集客 / ブランド形成 / マーケティング実行",
      revenueModel: "マーケティング支援フィー + 成果連動",
      competitiveEdge: "ABENGERSの経営戦略と一体化した、実行に踏み込むマーケティング",
      managementScope: "マーケティング・販売領域",
      hasPerformanceFee: true,
    },
    analysis: {
      centerPin: "商品価値を、必要とする顧客の購買へ確実に変換する実行力",
      strengths: ["集客", "販売", "ブランド形成"],
    },
    application: {
      koeniLearnings: ["ABENGERSの企業研究成果をマーケティング施策へ即転用する"],
      diffFromAbengers: "コエニはマーケティング実行に特化し、経営全体はABENGERSが担う",
    },
  },

  // --- ベンチャー・リンク(重要事例。指示書 第7章を反映) -------------
  {
    ...base({ id: "co-venturelink", confidenceLevel: "B", certaintyLevel: "strong", status: "published" }),
    name: "ベンチャー・リンク",
    nameKana: "ベンチャーリンク",
    logoText: "VL",
    category: "fc_support",
    industry: "FC本部支援 / 経営コンサルティング",
    tags: ["重要事例", "FC", "成功と失敗", "教訓"],
    relatedNews: [],
    businessModel: {
      targetCustomer: "新規事業を探す中小企業ネットワーク / 成長可能性のあるブランド",
      customerProblem: "地方の繁盛店を全国展開したい / 中小企業が新規事業を持ちたい",
      valueProposition:
        "地方の小規模な繁盛店を仕組み化し、全国展開可能なFCモデルへ成長させるプラットフォーム型FC支援",
      products: "FC本部構築 / 加盟開発 / マニュアル化 / 数値管理 / 人材育成 / FC本部への出資",
      revenueModel: "コンサルフィー / 加盟金 / ロイヤリティ / FC本部出資による株式公開・売却益",
      growthModel: "中小企業ネットワークとブランドを高速マッチングするプラットフォーム型FCモデル",
      competitiveEdge: "営業力・中小企業経営者ネットワーク・加盟店開発力",
      hasInvestment: true,
      hasExit: true,
    },
    analysis: {
      successFactors: [
        "FC化による事業の仕組み化",
        "圧倒的な営業力",
        "中小企業経営者ネットワーク",
        "加盟店開発力",
        "数値管理とマニュアル化",
        "人材育成と企業家人材の輩出",
        "結果への強いコミットメント",
      ],
      strengths: ["営業力", "FC本部構築力", "加盟企業ネットワーク", "事業責任者育成"],
      failureFactors: [
        "売上目標の暴走",
        "未完成の事業モデルの販売",
        "加盟店収益性の軽視",
        "強引な加盟開発と加盟金の先行回収",
        "未出店案件の発生",
        "加盟店との訴訟とブランド信頼の失墜",
        "短期KPIが長期的な顧客価値を破壊した",
      ],
      risks: ["短期売上KPI偏重による事業破壊"],
      outlook: "拡大モデルの限界が露呈し、FC市場における教訓として語り継がれる",
    },
    application: {
      abengersLearnings: [
        "事業の因数分解と成功モデルの標準化",
        "FC本部構築力と加盟企業ネットワーク",
        "事業責任者の育成と営業力",
        "出資と支援を組み合わせる考え方",
      ],
      avoidPoints: [
        "未検証モデルの販売",
        "「絶対に儲かる」という表現",
        "顧客成果より自社売上を優先すること",
        "加盟店の投資回収可能性を無視すること",
        "過度な加盟金の先行回収",
        "短期売上KPIだけによる評価",
        "品質管理前の急拡大",
        "実態を伴わない数値目標",
        "顧客との情報の非対称性",
      ],
      priority: "high",
    },
  },

  // --- ベンチマーク企業(要件17:未検証は仮説/要確認で登録) ---------
  benchmark("co-funai", "船井総合研究所", "フナイソウゴウケンキュウジョ", "consulting", "経営コンサルティング", {
    valueProposition: "業種別の「即時業績向上」を掲げる中堅・中小向け経営コンサルティング(要確認)",
    strengths: ["業種特化", "セミナー集客", "現場即実行"],
  }),
  benchmark("co-livcon", "リブ・コンサルティング", "リブコンサルティング", "consulting", "経営コンサルティング", {
    valueProposition: "成長企業・ベンチャー向けの実行支援型コンサルティング(要確認)",
    strengths: ["成長支援", "実行伴走"],
  }),
  benchmark("co-igpi", "経営共創基盤(IGPI)", "ケイエイキョウソウキバン", "coinvest_pe", "共同経営 / 事業再生 / PE", {
    valueProposition: "ハンズオンで経営に入り込み、事業再生・成長を共に担う(要確認)",
    strengths: ["ハンズオン経営", "事業再生", "投資"],
  }),
  benchmark("co-jafco", "JAFCO", "ジャフコ", "hands_on_vc", "ベンチャーキャピタル", {
    valueProposition: "国内最大級のベンチャーキャピタルとして成長投資と支援を行う(要確認)",
    strengths: ["投資規模", "IPO支援ネットワーク"],
  }),
  benchmark("co-globis", "グロービス・キャピタル・パートナーズ", "グロービスキャピタルパートナーズ", "hands_on_vc", "ハンズオンVC", {
    valueProposition: "ハンズオンで成長を支援するベンチャーキャピタル(要確認)",
    strengths: ["ハンズオン支援", "経営人材ネットワーク"],
  }),
  benchmark("co-circulation", "サーキュレーション", "サーキュレーション", "cxo_dispatch", "プロ人材・CXO派遣", {
    valueProposition: "プロ人材の知見を必要な期間だけ活用するプロシェアリング(要確認)",
    strengths: ["プロ人材ネットワーク", "柔軟な稼働"],
  }),
  benchmark("co-visasq", "ビザスク", "ビザスク", "cxo_dispatch", "スポットコンサル / 知見マッチング", {
    valueProposition: "1時間からの知見マッチングプラットフォーム(要確認)",
    strengths: ["知見のマッチング", "スピード"],
  }),
  benchmark("co-relic", "Relic", "レリック", "startup_studio", "スタートアップスタジオ / 事業共創", {
    valueProposition: "新規事業開発・共創を支援するスタートアップスタジオ(要確認)",
    strengths: ["新規事業開発", "共創プラットフォーム"],
  }),
];

/** ベンチマーク企業の簡易ファクトリ(仮説・要確認として登録) */
function benchmark(
  id: string,
  name: string,
  nameKana: string,
  category: string,
  industry: string,
  extra: { valueProposition?: string; strengths?: string[] },
): Company {
  return {
    ...base({ id, confidenceLevel: "C", certaintyLevel: "needs_check", status: "published" }),
    name,
    nameKana,
    logoText: name.slice(0, 2),
    category,
    industry,
    tags: ["ベンチマーク", "要確認"],
    businessModel: {
      valueProposition: extra.valueProposition,
    },
    analysis: {
      strengths: extra.strengths,
    },
    application: {
      priority: "medium",
    },
  };
}
