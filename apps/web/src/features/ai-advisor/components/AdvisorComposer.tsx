"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/AdvisorComposer.tsx
 * @description Sticky conversational input station with natural language editing and action triggers.
 * @module @fin-ai/web/features/ai-advisor/components/AdvisorComposer
 */

import { useEffect, useRef, useState } from "react";
import { PencilRuler, Send, Square } from "lucide-react";
import { Button, cn } from "@fin-ai/ui";
import { UI_COPY } from "@/lib";
import { type AgentConfirmation, type AgentActivity, deriveRunState } from "@/features/ai-advisor";

/** Props configuration for the {@link AdvisorComposer} component */
export interface AdvisorComposerProps {
  /** Current text content of the input composer */
  value: string;
  /** Change handler for the input textarea */
  onChange: (value: string) => void;
  /** Submit handler for sending the user's inquiry */
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  /** Whether an active LLM generation stream is in-flight */
  isStreaming: boolean;
  /** Abort callback to stop the active generation */
  onStop: () => void;
  /** Live tool activities for the current run — drives dynamic status labels */
  activities?: AgentActivity[];
  /** When an action awaits approval, composer enters modification mode */
  pendingConfirmation?: AgentConfirmation | null;
}

/**
 * Sticky bottom composer handling prompt input, auto-expanding textareas,
 * and conversational amendments for pending action approvals.
 */
export function AdvisorComposer({
  value,
  onChange,
  onSubmit,
  isStreaming,
  onStop,
  activities,
  pendingConfirmation,
}: AdvisorComposerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const runState = deriveRunState(activities, isStreaming);
  const editingPending = !!pendingConfirmation && !isStreaming;

  // Collapse textarea back to one row when the value is cleared
  useEffect(() => {
    if (inputRef.current && value === "") {
      inputRef.current.style.height = "auto";
    }
  }, [value]);

  /** Handles Enter key submission while allowing Shift+Enter for linebreaks */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isStreaming) {
        onSubmit(e as unknown as React.SubmitEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <div className="fn-advisor-composer">
      {/* Pending-action helper strip — editing is natural language */}
      {editingPending && (
        <p className="fn-advisor-composer-pending" role="note">
          <PencilRuler className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="fn-advisor-composer-pending-text">
            {UI_COPY.ADVISOR.COMPOSER.PENDING_PREFIX} {pendingConfirmation?.card.title ?? "action"}{" "}
            {UI_COPY.ADVISOR.COMPOSER.PENDING_SUFFIX}
          </span>
        </p>
      )}

      {/* Input textarea & submit form */}
      <form
        onSubmit={onSubmit}
        className={cn("fn-advisor-composer-form", isFocused && "is-focused")}
      >
        <textarea
          ref={inputRef}
          rows={1}
          placeholder={
            editingPending
              ? UI_COPY.ADVISOR.COMPOSER.PLACEHOLDER_EDITING
              : UI_COPY.ADVISOR.COMPOSER.PLACEHOLDER
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isStreaming}
          className="fn-advisor-composer-textarea"
          style={{ height: "auto", overflow: "auto" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />

        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="fn-advisor-composer-btn--stop"
            onClick={onStop}
            title={UI_COPY.ADVISOR.COMPOSER.STOP_A11Y}
          >
            <Square className="size-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="fn-advisor-composer-btn"
            disabled={!value.trim()}
            title={UI_COPY.ADVISOR.COMPOSER.SEND_A11Y}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>

      {/* Dynamic status strip during streaming */}
      {isStreaming && (
        <p className="fn-advisor-composer-status">
          {runState.isActive && <span className="fn-advisor-composer-status-pulse" />}
          <span className="fn-advisor-composer-status-label">{runState.statusLabel}</span>
          <span>·</span>
          <button type="button" onClick={onStop} className="fn-advisor-composer-stop-link">
            {UI_COPY.ADVISOR.COMPOSER.STOP_ACTION}
          </button>
        </p>
      )}

      {/* Idle keyboard shortcut hint */}
      {!isStreaming && (
        <p className="fn-advisor-composer-hint">
          {editingPending
            ? UI_COPY.ADVISOR.COMPOSER.CORRECTION_HINT
            : UI_COPY.ADVISOR.COMPOSER.ENTER_HINT}
        </p>
      )}
    </div>
  );
}
