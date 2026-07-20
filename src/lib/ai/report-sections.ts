import { REPORT_SECTIONS } from "@/lib/constants";

/**
 * AI が生成した月次レポートの Markdown を、12構成のセクションへ分解する。
 * 見出し `## 1. タイトル` / `## タイトル` を検出し、本文を次の見出しまで取り込む。
 * クライアント／サーバー双方から利用できる純関数。
 */
export function parseReportSections(markdown: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = markdown.split("\n");

  // 各セクション見出しの出現行を特定
  const marks: { title: string; line: number }[] = [];
  lines.forEach((line, i) => {
    const heading = line.match(/^#{1,3}\s*(?:\d+\.\s*)?(.+?)\s*$/);
    if (!heading) return;
    const text = heading[1]?.trim() ?? "";
    const matched = REPORT_SECTIONS.find((s) => text === s || text.includes(s));
    if (matched && !marks.some((m) => m.title === matched)) {
      marks.push({ title: matched, line: i });
    }
  });

  marks.forEach((mark, idx) => {
    const end = idx + 1 < marks.length ? marks[idx + 1]!.line : lines.length;
    const body = lines
      .slice(mark.line + 1, end)
      .join("\n")
      .trim();
    result[mark.title] = body;
  });

  return result;
}
