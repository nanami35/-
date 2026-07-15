/**
 * モック生成の汎用フォールバック。
 * 実際のタスク別モック下書きは service.ts の buildMockDraft が担う。
 * これは万一 service が直接 provider.generate を呼んだ場合の保険。
 */
export async function mockGenerate(_system: string, user: string): Promise<string> {
  const head = user.split("\n").find((l) => l.trim().length > 0) ?? "";
  return [
    "> ⚠️ これはデモ用のモック生成です（外部 AI へは接続していません）。",
    "",
    "入力コンテキストに基づく下書きの雛形です。担当者が編集してご利用ください。",
    "",
    head,
  ].join("\n");
}
