"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/AdvisorComposer.tsx
 * @description Sticky conversational input station with natural language editing and action triggers.
 * @module @finai/web/features/ai-advisor/components/AdvisorComposer
 */

import { useEffect, useRef, useState } from "react";
import { PencilRuler, Send, Square } from "lucide-react";
import { Button, cn } from "@finai/ui";
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
    <div className="border-border/80 bg-secondary/10 border-t p-3 sm:p-4">
      {/* Pending-action helper strip — editing is natural language */}
      {editingPending && (
        <p
          className="text-primary bg-primary/5 border-primary/20 mb-2 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium"
          role="note"
        >
          <PencilRuler className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">
            {UI_COPY.ADVISOR.COMPOSER.PENDING_PREFIX} {pendingConfirmation?.card.title ?? "action"}{" "}
            {UI_COPY.ADVISOR.COMPOSER.PENDING_SUFFIX}
          </span>
        </p>
      )}

      {/* Input textarea & submit form */}
      <form
        onSubmit={onSubmit}
        className={cn(
          "bg-background border-border/70 flex items-center gap-2 rounded-xl border px-3 py-2 transition-all",
          isFocused && "border-primary/40 ring-primary/10 ring-2",
        )}
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
          className="text-foreground placeholder:text-muted-foreground flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none disabled:opacity-50"
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
            className="size-9 shrink-0 rounded-lg"
            onClick={onStop}
            title={UI_COPY.ADVISOR.COMPOSER.STOP_A11Y}
          >
            <Square className="size-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className={cn(
              "size-9 shrink-0 rounded-lg transition-opacity",
              !value.trim() && "opacity-40",
            )}
            disabled={!value.trim()}
            title={UI_COPY.ADVISOR.COMPOSER.SEND_A11Y}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>

      {/* Dynamic status strip during streaming */}
      {isStreaming && (
        <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5 text-center text-[11px]">
          {runState.isActive && <span className="bg-primary size-1.5 animate-pulse rounded-full" />}
          <span className="text-foreground font-medium">{runState.statusLabel}</span>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            onClick={onStop}
            className="hover:text-foreground underline-offset-2 hover:underline"
          >
            {UI_COPY.ADVISOR.COMPOSER.STOP_ACTION}
          </button>
        </p>
      )}

      {/* Idle keyboard shortcut hint */}
      {!isStreaming && (
        <p className="text-muted-foreground mt-1.5 text-center text-[10px]">
          {editingPending
            ? UI_COPY.ADVISOR.COMPOSER.CORRECTION_HINT
            : UI_COPY.ADVISOR.COMPOSER.ENTER_HINT}
        </p>
      )}
    </div>
  );
}
