"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { askAction } from "./actions";
import { PageHeader } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/markdown";
import type { AiAnswer, EntityType } from "@/lib/types";
import { CONFIDENCE_LABELS, CERTAINTY_LABELS } from "@/lib/labels";
import { Sparkles, Send, FileText, Info } from "lucide-react";

const SUGGESTIONS = [
  "ABENGERSとハンズオンVCの違いは？",
  "ベンチャー・リンクの成功要因と失敗要因を教えて",
  "飲食店のFC本部構築で参考になる企業は？",
  "月商1,000万円の飲食店で確認すべきKPIは？",
  "ABENGERSの競争優位性を整理して",
];

const HREF: Record<string, string> = {
  company: "/companies",
  person: "/people",
  business_model: "/business-models",
  knowledge: "/knowledge",
  case: "/cases",
  project: "/projects",
  meeting: "/meetings",
  source: "/sources",
};

interface Msg {
  role: "user" | "assistant";
  text?: string;
  answer?: AiAnswer;
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatInner />
    </Suspense>
  );
}

function ChatInner() {
  const params = useSearchParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, start] = useTransition();

  const send = (question: string) => {
    if (!question.trim()) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    start(async () => {
      const answer = await askAction(question);
      setMessages((m) => [...m, { role: "assistant", answer }]);
    });
  };

  // 検索からの遷移で q があれば自動送信
  useEffect(() => {
    const q = params.get("q");
    if (q) send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="AIチャット"
        description="登録済みの社内情報と承認済み外部情報のみを参照して回答します(RAG)。参照元・信頼度・推論を明示します。"
      />

      {messages.length === 0 && (
        <Card className="mb-4">
          <CardBody>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy">
              <Sparkles className="h-4 w-4 text-gold" /> 質問例
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  <Badge tone="gray">{s}</Badge>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-navy px-4 py-2.5 text-sm text-white">
                {m.text}
              </div>
            </div>
          ) : (
            <AnswerCard key={i} answer={m.answer!} />
          ),
        )}
        {pending && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Sparkles className="h-4 w-4 animate-pulse text-gold" />
            登録情報を検索し、回答を生成しています…
          </div>
        )}
      </div>

      <form
        className="sticky bottom-4 mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-navy-100 bg-white p-2 shadow-panel">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="質問を入力…(例:この企業からABENGERSが学ぶべき点は？)"
            className="h-10 flex-1 bg-transparent px-2 text-sm focus:outline-none"
          />
          <Button type="submit" size="sm" disabled={pending || !input.trim()}>
            <Send className="h-4 w-4" />
            送信
          </Button>
        </div>
      </form>
    </div>
  );
}

function AnswerCard({ answer }: { answer: AiAnswer }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-700 text-gold">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-navy">ナレッジAI</span>
          <Badge tone={answer.isMock ? "gray" : "green"}>
            {answer.isMock ? "モックモード" : "実APIモード"}
          </Badge>
          {!answer.hasEnoughInfo && <Badge tone="gold">情報不足の可能性</Badge>}
        </div>

        <div className="prose-jp">
          <Markdown source={answer.answer} />
        </div>

        {answer.reasoningNote && (
          <div className="flex items-start gap-2 rounded-lg bg-canvas px-3 py-2 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{answer.reasoningNote}</span>
          </div>
        )}

        {answer.citations.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <FileText className="h-3.5 w-3.5" /> 参照した情報 / 出典
            </div>
            <div className="space-y-1.5">
              {answer.citations.map((c) => (
                <Link
                  key={`${c.entityType}-${c.entityId}`}
                  href={`${HREF[c.entityType]}/${c.entityId}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-navy-100/60 px-3 py-2 hover:bg-navy-50/40"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-navy">{c.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                      <Badge tone={c.isInternal ? "blue" : "gray"}>{c.isInternal ? "社内情報" : "外部情報"}</Badge>
                      <span>信頼度: {CONFIDENCE_LABELS[c.confidenceLevel]}</span>
                      <span>／ {CERTAINTY_LABELS[c.certaintyLevel]}</span>
                      {c.lastVerifiedAt && <span>／ 最終確認 {c.lastVerifiedAt}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
