"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { cn } from "@finai/ui";
import type { AgentActivity } from "../api/agentTypes";
import { deriveRunState, formatDuration, standbyLabel } from "../utils/deriveRunState";
import { ActivityStepRow } from "./ActivityStepRow";

/** Recent rows shown in the collapsed view (running step + completed tail). */
const COLLAPSED_ROWS = 3;

interface ActivityTimelineProps {
  /** Every activity of this run, in true execution order (append-only). */
  activities: AgentActivity[];
  /** True while the run's SSE stream is still open. */
  isStreaming: boolean;
  /** True once the final answer has started streaming (drives the standby row label). */
  hasText?: boolean;
}

/**
 * The live activity stream of one agent run — a first-class part of the run,
 * not a loading placeholder. Two representations:
 *
 * - Collapsed: overall status, the current operation, a few recent completed
 *   steps, and a "Show details" toggle. After completion it reduces to
 *   "✓ Analyzed your finances · N steps · X.Xs".
 * - Expanded: the complete user-safe execution history — every real step with
 *   its summary and duration, in arrival order.
 *
 * Every row originates from a real SSE event (tool, lifecycle phase, or
 * approval gate); nothing is timer-fabricated and events are never reordered.
 */
export function ActivityTimeline({
  activities,
  isStreaming,
  hasText = false,
}: ActivityTimelineProps) {
  // Collapsed by default; the user can expand at any time (during or after the
  // run) and their choice is respected — no forced re-collapse.
  const [expanded, setExpanded] = useState(false);
  const state = deriveRunState(activities, isStreaming);

  const hasError = state.hasError;
  const hasRunningRow = activities.some((a) => a.status === "running");
  // Standby row: while the stream is open but no real event is currently
  // running (gap between tool steps, or final-answer tokens streaming), the
  // collapsed view keeps a truthful "current operation" visible instead of a
  // stale all-✓ checklist. Tied to the open stream only — never a timer.
  const standby: AgentActivity | null =
    isStreaming && !expanded && !hasRunningRow && activities.length > 0
      ? { tool: "phase:standby", kind: "phase", status: "running", label: standbyLabel(hasText) }
      : null;

  const showRows = expanded || (isStreaming && activities.length > 0);
  // Collapsed shows the recent completed tail + the current operation;
  // expanded shows the complete real history (no standby row).
  const visible = expanded
    ? activities
    : standby
      ? [...activities.slice(-(COLLAPSED_ROWS - 1)), standby]
      : activities.slice(-COLLAPSED_ROWS);
  const currentKey = state.currentTool;

  const headerTitle = expanded
    ? "FinAI activity"
    : isStreaming
      ? "FinAI is thinking…"
      : hasError
        ? "Finished with some issues"
        : "Analyzed your finances";

  const summaryMeta =
    !expanded && !isStreaming
      ? [
          state.totalCount > 0 ? `${state.totalCount} steps` : null,
          state.durationMs != null && state.durationMs > 0
            ? formatDuration(state.durationMs)
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <div className="bg-muted/40 border-border rounded-xl border">
      {/* Header — aria-live announces only meaningful transitions (thinking →
          approval → done), never every low-level step. */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-left"
      >
        {expanded ? (
          <ChevronUp className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
        ) : isStreaming ? (
          <Sparkles className="text-primary size-3.5 shrink-0" aria-hidden="true" />
        ) : hasError ? (
          <AlertTriangle className="text-destructive size-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <Check className="text-primary size-3.5 shrink-0" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1" aria-live="polite">
          <span
            className={cn(
              "block text-[13px] font-medium",
              isStreaming ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {headerTitle}
            {isStreaming && !expanded && activities.length === 0 ? "…" : ""}
          </span>
          {summaryMeta && (
            <span className="text-muted-foreground/70 mt-0.5 block text-xs">{summaryMeta}</span>
          )}
        </span>
        {isStreaming && !expanded && (
          <Loader2
            className="text-primary shrink-0 motion-safe:size-3.5 motion-safe:animate-spin"
            aria-hidden="true"
          />
        )}
        <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-[11px] font-medium">
          {expanded ? "Hide details" : "Show details"}
          <ChevronDown
            className={cn("motion-safe size-3 transition-transform", expanded && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Steps — full history when expanded; recent tail while running. */}
      {showRows && (
        <ul id="agent-activity-steps" className="border-border/60 border-t px-3.5 py-1.5">
          {visible.map((activity, index) => (
            <ActivityStepRow
              // Append-only list, so `tool + index` is stable across renders
              // even when the same tool runs twice in one conversation turn.
              key={`${activity.tool}-${index}`}
              activity={activity}
              expanded={expanded}
              isCurrent={
                !expanded &&
                activity.status === "running" &&
                (activity.tool === currentKey || activity.tool === "phase:standby")
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
