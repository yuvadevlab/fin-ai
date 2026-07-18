"use client";

import { useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@finai/ui";
import type { ChatMessage } from "../api/useAiChat";
import { MarkdownMessage } from "./MarkdownMessage";

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
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
            Your financial data is loaded. Try a suggested prompt on the right.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((m, i) => (
        <div
          key={i}
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
              "max-w-xl space-y-3 rounded-2xl px-4 py-3 text-sm shadow-sm",
              m.role === "assistant"
                ? "bg-secondary text-foreground"
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
      ))}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
