import { Fragment } from "react";

// 依存ゼロの軽量Markdownレンダラ(見出し/箇条書き/番号/引用/太字/段落)。
// ノウハウの実践方法などのリッチテキスト表示に利用(要件8-9)。
export function Markdown({ source }: { source?: string }) {
  if (!source) return <span className="text-sm text-muted">—</span>;
  const lines = source.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const flush = (key: string) => {
    if (list.length === 0) return;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={key} className={ordered ? "my-2 list-decimal pl-5" : "my-2 list-disc pl-5"}>
        {list.map((li, i) => (
          <li key={i} className="my-0.5 text-sm leading-6 text-ink">
            {inline(li)}
          </li>
        ))}
      </Tag>,
    );
    list = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (/^#{1,3}\s+/.test(line)) {
      flush(`l${idx}`);
      const text = line.replace(/^#{1,3}\s+/, "");
      blocks.push(
        <h3 key={idx} className="mt-4 mb-1.5 text-sm font-semibold text-navy">
          {inline(text)}
        </h3>,
      );
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (ordered) flush(`l${idx}`);
      ordered = false;
      list.push(line.replace(/^\s*[-*]\s+/, ""));
    } else if (/^\s*\d+\.\s+/.test(line)) {
      if (!ordered) flush(`l${idx}`);
      ordered = true;
      list.push(line.replace(/^\s*\d+\.\s+/, ""));
    } else if (/^\s*>\s?/.test(line)) {
      flush(`l${idx}`);
      blocks.push(
        <blockquote key={idx} className="my-2 border-l-2 border-gold pl-3 text-sm text-muted">
          {inline(line.replace(/^\s*>\s?/, ""))}
        </blockquote>,
      );
    } else if (line.trim() === "") {
      flush(`l${idx}`);
    } else {
      flush(`l${idx}`);
      blocks.push(
        <p key={idx} className="my-1.5 text-sm leading-7 text-ink">
          {inline(line)}
        </p>,
      );
    }
  });
  flush("last");

  return <div>{blocks}</div>;
}

// **bold** のみ対応のインライン処理
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-navy">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}
