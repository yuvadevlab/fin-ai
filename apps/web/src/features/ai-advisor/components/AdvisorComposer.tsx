"use client";

import { useEffect, useRef, useState } from "react";
import { PencilRuler, Send, Square } from "lucide-react";
import { Button, cn } from "@finai/ui";
import type { AgentConfirmation } from "../api/agentTypes";
import { deriveRunState } from "../utils/deriveRunState";
import type { AgentActivity } from "../api/agentTypes";

interface AdvisorComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  isStreaming: boolean;
  onStop: () => void;
  /** Live tool activities for the current run — drives the dynamic status label. */
  activities?: AgentActivity[];
  /** When an action awaits approval, the composer becomes an editing surface. */
  pendingConfirmation?: AgentConfirmation | null;
}

/**
 * Sticky composer at the bottom of the conversation.
 *
 * When a write action is waiting for approval (`pendingConfirmation`), the
 * placeholder and helper strip switch to "modify the pending action" mode —
 * natural conversation edits (e.g. "use HDFC", "₹550", "date Sep 6") work
 * exactly like the original intent; they never execute the action.
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

  // Collapse the textarea back to one row when the value is cleared (e.g.
  // after submit) — programmatic value changes don't fire `onInput`.
  useEffect(() => {
    if (inputRef.current && value === "") {
      inputRef.current.style.height = "auto";
    }
  }, [value]);

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
      {/* Pending-action helper strip — editing is natural language, no /edit */}
      {editingPending && (
        <p
          className="text-primary bg-primary/5 border-primary/20 mb-2 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium"
          role="note"
        >
          <PencilRuler className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">
            Pending: {pendingConfirmation?.card.title ?? "action"} — say a correction (e.g. “use
            HDFC”, “₹550”, “date Sep 6”) or confirm it above.
          </span>
        </p>
      )}

      {/* Input area */}
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
              ? "Modify the pending action…"
              : "Ask FinAI to analyze, plan, or take action…"
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
            title="Stop generating"
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
            title="Send"
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>

      {/* Footer hint */}
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
            stop
          </button>
        </p>
      )}
      {!isStreaming && (
        <p className="text-muted-foreground mt-1.5 text-center text-[10px]">
          {editingPending
            ? "Corrections never execute — only Confirm does."
            : "Enter to send · Shift+Enter for new line"}
        </p>
      )}
    </div>
  );
}
