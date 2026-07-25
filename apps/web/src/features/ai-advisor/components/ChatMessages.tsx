"use client";

import { useRef, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@finai/ui";
import type { ChatMessage } from "../api/useAiChat";
import { MarkdownMessage } from "./MarkdownMessage";
import { extractFollowUpQuestions } from "@finai/ai-engine";

interface ChatMessagesProps {
  messages: ChatMessage[];
  onSelectFollowUp?: (question: string) => void;
}

export function ChatMessages({ messages, onSelectFollowUp }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
          <Sparkles className="text-primary size-8" />
        </div>
        <div>
          <p className="text-foreground font-semibold">Ask FinAI anything</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Your financial context is loaded. Try a suggested prompt from the sidebar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((m, i) => {
        const followUps =
          m.role === "assistant" && !m.streaming && m.text ? extractFollowUpQuestions(m.text) : [];

        const isLastAssistantMessage = m.role === "assistant" && i === messages.length - 1;

        return (
          <div key={i} className="space-y-3">
            <div
              className={cn(
                "animate-in slide-in-from-bottom-2 flex gap-3 duration-200",
                m.role === "user" && "flex-row-reverse",
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm",
                  m.role === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground",
                )}
              >
                {m.role === "assistant" ? (
                  <Sparkles className={cn("size-4", m.streaming && "animate-pulse")} />
                ) : (
                  "ME"
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-2xl space-y-3 rounded-2xl px-4 py-3 text-sm shadow-sm",
                  m.role === "assistant"
                    ? "bg-secondary text-foreground border-border/50 border"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {m.role === "assistant" ? (
                  <div className="text-sm leading-relaxed">
                    {m.text ? (
                      <MarkdownMessage content={m.text} />
                    ) : (
                      <span className="text-muted-foreground animate-pulse text-xs">Thinking…</span>
                    )}
                    {m.streaming && m.text && (
                      <span className="text-primary ml-0.5 animate-pulse font-bold">▍</span>
                    )}
                  </div>
                ) : (
                  <p className="leading-relaxed">{m.text}</p>
                )}
              </div>
            </div>

            {/* Render 1-click Follow-up Suggestions if available */}
            {isLastAssistantMessage && followUps.length > 0 && onSelectFollowUp && (
              <div className="ml-11 flex flex-col gap-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Suggested Next Steps
                </p>
                <div className="flex flex-wrap gap-2">
                  {followUps.map((question, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => onSelectFollowUp(question)}
                      className="bg-card hover:bg-accent hover:text-accent-foreground border-border/80 text-foreground group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition active:scale-95"
                    >
                      <span>{question}</span>
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
