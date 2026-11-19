"use client";

import { ArrowRight, User } from "lucide-react";
import { extractFollowUpQuestions } from "@fin-ai/ai-engine/extract-follow-ups";
import { UI_COPY } from "@/lib";
import { AgentRun } from "./AgentRun";
import type { AgentChatMessage } from "@/features/ai-advisor";

interface ChatMessagesProps {
  messages: AgentChatMessage[];
  onSelectFollowUp?: (question: string) => void;
  onConfirmAction?: (actionId: string, tool: string) => void;
  onRejectAction?: (actionId: string, itemIndex?: number) => void;
  executingActionId?: string | null;
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
  onRejectAction,
  executingActionId,
}: ChatMessagesProps) {
  return (
    <div className="fn-chat-thread">
      {messages.map((message, idx) => {
        const isAssistant = message.role === "assistant";
        const isLastMessage = idx === messages.length - 1;

        // Follow-up suggestions only on the final non-streaming assistant turn.
        const followUps =
          isAssistant && !message.streaming && message.text && isLastMessage
            ? extractFollowUpQuestions(message.text)
            : [];

        return (
          <div key={idx} className="fn-chat-turn">
            {isAssistant ? (
              /* Assistant turn — composed AgentRun */
              <AgentRun
                message={message}
                onConfirmAction={onConfirmAction ?? (() => {})}
                onRejectAction={onRejectAction ?? ((_id, _idx) => {})}
                executingActionId={executingActionId}
              />
            ) : (
              /* User message — right-aligned bubble */
              <div className="fn-chat-user-row">
                <div className="fn-chat-user-avatar">
                  <User className="fn-icon-md" aria-hidden="true" />
                </div>
                <div className="fn-chat-user-bubble">
                  <p className="fn-chat-user-text">{message.text}</p>
                </div>
              </div>
            )}

            {/* Follow-up suggestions below the last assistant turn */}
            {followUps.length > 0 && onSelectFollowUp && (
              <div className="fn-chat-followups">
                <p className="fn-chat-followups-title">
                  {UI_COPY.ADVISOR.FEED.SUGGESTED_FOLLOW_UPS}
                </p>
                <div className="fn-chat-followups-list">
                  {followUps.map((question, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => onSelectFollowUp(question)}
                      className="fn-chat-followup-chip"
                    >
                      <span>{question}</span>
                      <ArrowRight className="fn-chat-followup-icon" />
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
