"use client";

import { ArrowRight, User } from "lucide-react";
import { extractFollowUpQuestions } from "@finai/ai-engine";
import { AgentRun } from "./AgentRun";
import type { AgentChatMessage } from "../api";

interface ChatMessagesProps {
  messages: AgentChatMessage[];
  onSelectFollowUp?: (question: string) => void;
  onConfirmAction?: (actionId: string, tool: string) => void;
  onConfirmItem?: (actionId: string, tool: string, index: number) => void;
  onConfirmAll?: (actions: Array<{ actionId: string; tool: string }>) => void;
  onRejectAction?: (actionId: string) => void;
  executingActionId?: string | null;
  executingItemIndex?: number | null;
  isExecutingAll?: boolean;
  /** actionId → indexes whose individual Confirm already succeeded. */
  confirmedItems?: Record<string, number[]>;
}

/**
 * Renders the full conversation thread for the AI Advisor.
 *
 * Each user message is a simple bubble. Each assistant message is an
 * `AgentRun` — a composed block showing the agent's activity, any structured
 * financial insight, the prose response, and confirmation cards.
 *
 * Follow-up suggestions are extracted from the last assistant message and
 * rendered as clickable chips below it.
 *
 * NOTE: this component deliberately owns NO scroll logic. Scrolling is a
 * policy of the scroll container (see `hooks/useChatAutoScroll.ts`) — the
 * previous per-token `scrollIntoView` here caused the streaming scroll jerk.
 */
export function ChatMessages({
  messages,
  onSelectFollowUp,
  onConfirmAction,
  onConfirmItem,
  onConfirmAll,
  onRejectAction,
  executingActionId,
  executingItemIndex,
  isExecutingAll,
  confirmedItems,
}: ChatMessagesProps) {
  return (
    <div className="space-y-5">
      {messages.map((message, idx) => {
        const isAssistant = message.role === "assistant";
        const isLastMessage = idx === messages.length - 1;

        // Follow-up suggestions only on the final non-streaming assistant turn.
        const followUps =
          isAssistant && !message.streaming && message.text && isLastMessage
            ? extractFollowUpQuestions(message.text)
            : [];

        return (
          <div key={idx} className="space-y-3">
            {isAssistant ? (
              /* Assistant turn — composed AgentRun */
              <AgentRun
                message={message}
                onConfirmAction={onConfirmAction ?? (() => {})}
                onConfirmItem={onConfirmItem ?? (() => {})}
                onConfirmAll={onConfirmAll ?? (() => {})}
                onRejectAction={onRejectAction ?? (() => {})}
                executingActionId={executingActionId}
                executingItemIndex={executingItemIndex}
                isExecutingAll={isExecutingAll}
                confirmedItems={confirmedItems}
              />
            ) : (
              /* User message — right-aligned bubble */
              <div className="flex flex-row-reverse gap-3">
                <div className="bg-secondary text-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm">
                  <User className="size-4" aria-hidden="true" />
                </div>
                <div className="bg-primary text-primary-foreground max-w-2xl rounded-2xl px-4 py-3 text-sm shadow-sm">
                  <p className="leading-relaxed">{message.text}</p>
                </div>
              </div>
            )}

            {/* Follow-up suggestions below the last assistant turn */}
            {followUps.length > 0 && onSelectFollowUp && (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Suggested follow-ups
                </p>
                <div className="flex flex-wrap gap-2">
                  {followUps.map((question, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => onSelectFollowUp(question)}
                      className="bg-card hover:bg-accent hover:text-accent-foreground border-border/80 text-foreground group flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95"
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
    </div>
  );
}
