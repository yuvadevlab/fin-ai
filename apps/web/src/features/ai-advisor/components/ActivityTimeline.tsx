"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  ListTree,
  Loader2,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@finai/ui";
import type { AgentActivity, AgentRunLogEntry } from "../api/agentTypes";
import { deriveRunState, formatDuration, standbyLabel } from "../utils/deriveRunState";
import { ActivityStepRow } from "./ActivityStepRow";
import { LiveRunConsole } from "./LiveRunConsole";

const COLLAPSED_ROWS = 3;

interface ActivityTimelineProps {
  activities: AgentActivity[];
  logs?: AgentRunLogEntry[];
  isStreaming: boolean;
  hasText?: boolean;
}

export function ActivityTimeline({
  activities,
  logs = [],
  isStreaming,
  hasText = false,
}: ActivityTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"steps" | "logs">("steps");
  const state = deriveRunState(activities, isStreaming);

  const hasError = state.hasError;
  const hasRunningRow = activities.some((a) => a.status === "running");
  const latestLog = logs[logs.length - 1];

  const standby: AgentActivity | null =
    isStreaming && !expanded && !hasRunningRow && activities.length > 0
      ? { tool: "phase:standby", kind: "phase", status: "running", label: standbyLabel(hasText) }
      : null;

  const showRows = expanded || (isStreaming && activities.length > 0);
  const visible = expanded
    ? activities
    : standby
      ? [...activities.slice(-(COLLAPSED_ROWS - 1)), standby]
      : activities.slice(-COLLAPSED_ROWS);
  const currentKey = state.currentTool;

  const headerTitle = expanded
    ? "FinAI activity & execution log"
    : isStreaming
      ? latestLog
        ? latestLog.message
        : "FinAI is thinking…"
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
    <div className="bg-muted/40 border-border overflow-hidden rounded-xl border">
      {/* Header button */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="hover:bg-muted/60 flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-left transition"
      >
        {expanded ? (
          <ChevronUp className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
        ) : isStreaming ? (
          <Sparkles className="text-primary size-3.5 shrink-0 animate-pulse" aria-hidden="true" />
        ) : hasError ? (
          <AlertTriangle className="text-destructive size-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <Check className="text-primary size-3.5 shrink-0" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1" aria-live="polite">
          <span
            className={cn(
              "block truncate text-[13px] font-medium",
              isStreaming ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {isStreaming && <span className="text-primary mr-1.5 font-mono text-[11px]">⚡</span>}
            {headerTitle}
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

      {/* Expanded Mode Tabs (Steps vs Live Terminal) */}
      {expanded && (
        <div className="bg-muted/30 border-border/60 flex items-center justify-between border-t px-3.5 py-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("steps")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                viewMode === "steps"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ListTree className="size-3" />
              <span>Steps ({activities.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("logs")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs font-medium transition",
                viewMode === "logs"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Terminal className="size-3" />
              <span>Live Console</span>
              {logs.length > 0 && <span className="text-[10px] opacity-75">({logs.length})</span>}
              {isStreaming && (
                <span className="size-1.5 animate-ping rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
          <span className="text-muted-foreground text-[11px]">
            {isStreaming ? "Live stream active" : "Execution complete"}
          </span>
        </div>
      )}

      {/* Steps or Live Terminal body */}
      {showRows && (
        <>
          {expanded && viewMode === "logs" ? (
            <div className="border-border/40 border-t bg-zinc-950/50 p-2">
              <LiveRunConsole logs={logs} isStreaming={isStreaming} />
            </div>
          ) : (
            <ul
              id="agent-activity-steps"
              aria-label="Agent execution steps"
              className="border-border/60 border-t px-3.5 py-1.5"
            >
              {visible.map((activity, index) => (
                <ActivityStepRow
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
        </>
      )}
    </div>
  );
}
