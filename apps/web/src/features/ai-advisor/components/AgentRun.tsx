"use client";

import { useMemo } from "react";
import { AlertTriangle, MessagesSquare, Zap } from "lucide-react";
import { cn, Shimmer } from "@fin-ai/ui";
import { MarkdownMessage } from "./MarkdownMessage";
import { ActivityTimeline } from "./ActivityTimeline";
import { FinancialInsight } from "./FinancialInsight";
import { RichConfirmationCard } from "./RichConfirmationCard";
import { AgentConfirmationStatus } from "@fin-ai/shared-types";
import type { AgentChatMessage } from "../api/agentTypes";
import { extractFinancialInsight } from "../utils/financialInsight";
import { UI_COPY } from "@/lib/ui-copy";

interface AgentRunProps {
  message: AgentChatMessage;
  onConfirmAction: (actionId: string, tool: string) => void;
  onRejectAction: (actionId: string, itemIndex?: number) => void;
  executingActionId?: string | null;
}

export function AgentRun({
  message,
  onConfirmAction,
  onRejectAction,
  executingActionId,
}: AgentRunProps) {
  const {
    text = "",
    reasoning = "",
    reasoningStreaming = false,
    activities = [],
    confirmations = [],
    logs = [],
    streaming = false,
    error,
  } = message;
  const hasActivities = activities.length > 0;
  const hasConfirmations = !!confirmations && confirmations.length > 0;

  // Deduplicate: if a prominent financial figure is extracted into the card,
  // render only the remaining text in MarkdownMessage so the heading and amount
  // are never shown twice.
  const insight = useMemo(
    () => (!streaming && !error && text ? extractFinancialInsight(text) : null),
    [streaming, error, text],
  );
  const proseContent = insight?.remainingText ? insight.remainingText : text;

  return (
    <div className="fn-chat-turn">
      {/* 0. Runtime badge — tells the user which mode produced this reply */}
      {message.mode && (
        <div className="fn-chat-mode-row">
          <span
            className={cn(
              "fn-chat-mode-tag",
              message.mode === "agent" ? "fn-chat-mode-tag--agent" : "fn-chat-mode-tag--advisor",
            )}
          >
            {message.mode === "agent" ? (
              <Zap className="fn-chat-mode-icon" aria-hidden="true" />
            ) : (
              <MessagesSquare className="fn-chat-mode-icon" aria-hidden="true" />
            )}
            {message.mode === "agent" ? "Agent mode" : "Advisor mode"}
          </span>
        </div>
      )}

      {/* 1. Unified Copilot-style thinking, steps & live console */}
      {(hasActivities || streaming || logs.length > 0 || !!reasoning) && (
        <ActivityTimeline
          activities={activities}
          logs={logs}
          reasoning={reasoning}
          reasoningStreaming={reasoningStreaming}
          isStreaming={streaming}
          hasText={text.length > 0}
        />
      )}

      {/* 2. Financial insight card */}
      {insight && <FinancialInsight text={text} />}

      {/* 3. Prose response (deduplicated) */}
      {proseContent ? (
        <div className="fn-chat-prose">
          <MarkdownMessage content={proseContent} />
        </div>
      ) : (
        streaming &&
        !reasoningStreaming && (
          <div className="fn-chat-prose">
            <Shimmer>{UI_COPY.ADVISOR.ACTIVITY_TIMELINE.THINKING}</Shimmer>
          </div>
        )
      )}

      {/* 4. Error block */}
      {error && (
        <div className="fn-chat-error">
          <div className="fn-chat-error-layout">
            <AlertTriangle className="fn-chat-error-icon" aria-hidden="true" />
            <div className="fn-chat-error-body">
              <p className="fn-chat-error-title">{UI_COPY.ADVISOR.ERROR_TITLE}</p>
              <p className="fn-chat-error-message">{error}</p>
              <p className="fn-chat-error-description">{UI_COPY.ADVISOR.ERROR_DESCRIPTION}</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Confirmation cards */}
      {hasConfirmations &&
        (() => {
          let firstPendingSeen = false;
          return confirmations!.map((confirmation) => {
            const isPending = confirmation.status === AgentConfirmationStatus.PENDING;
            const disabled = isPending && firstPendingSeen;
            if (isPending) firstPendingSeen = true;
            const isExecuting = executingActionId === confirmation.actionId;
            return (
              <RichConfirmationCard
                key={confirmation.actionId}
                confirmation={confirmation}
                onConfirm={onConfirmAction}
                onReject={onRejectAction}
                disabled={disabled || executingActionId !== null}
                isExecuting={isExecuting}
              />
            );
          });
        })()}
    </div>
  );
}
