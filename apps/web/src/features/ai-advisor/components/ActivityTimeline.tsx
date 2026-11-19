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
import { cn } from "@fin-ai/ui";
import type { AgentActivity, AgentRunLogEntry } from "../api/agentTypes";
import { deriveRunState, formatDuration, standbyLabel } from "../utils/deriveRunState";
import { ActivityStepRow } from "./ActivityStepRow";
import { LiveRunConsole } from "./LiveRunConsole";
import { UI_COPY } from "@/lib/ui-copy";

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
    ? UI_COPY.ADVISOR.ACTIVITY_TIMELINE.HEADER_TITLE
    : isStreaming
      ? latestLog
        ? latestLog.message
        : UI_COPY.ADVISOR.ACTIVITY_TIMELINE.THINKING
      : hasError
        ? UI_COPY.ADVISOR.ACTIVITY_TIMELINE.ISSUES
        : UI_COPY.ADVISOR.ACTIVITY_TIMELINE.ANALYZED;

  const summaryMeta =
    !expanded && !isStreaming
      ? [
          state.totalCount > 0
            ? UI_COPY.ADVISOR.ACTIVITY_TIMELINE.STEP_COUNT(state.totalCount)
            : null,
          state.durationMs != null && state.durationMs > 0
            ? formatDuration(state.durationMs)
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <div className="fn-timeline">
      {/* Header button */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="fn-timeline-header"
      >
        {expanded ? (
          <ChevronUp
            className="fn-timeline-header-icon fn-timeline-header-icon--muted"
            aria-hidden="true"
          />
        ) : isStreaming ? (
          <Sparkles
            className="fn-timeline-header-icon fn-timeline-header-icon--streaming"
            aria-hidden="true"
          />
        ) : hasError ? (
          <AlertTriangle
            className="fn-timeline-header-icon fn-timeline-header-icon--error"
            aria-hidden="true"
          />
        ) : (
          <Check
            className="fn-timeline-header-icon fn-timeline-header-icon--success"
            aria-hidden="true"
          />
        )}
        <span className="fn-timeline-header-content" aria-live="polite">
          <span
            className={cn(
              "fn-timeline-header-title",
              isStreaming ? "fn-timeline-header-title--active" : "fn-timeline-header-title--idle",
            )}
          >
            {isStreaming && <span className="font-mono text-[11px] text-primary mr-1.5">⚡</span>}
            {headerTitle}
          </span>
          {summaryMeta && <span className="fn-timeline-header-meta">{summaryMeta}</span>}
        </span>
        {isStreaming && !expanded && (
          <Loader2
            className="fn-timeline-header-icon fn-timeline-header-icon--streaming animate-spin"
            aria-hidden="true"
          />
        )}
        <span className="fn-timeline-header-toggle">
          {expanded
            ? UI_COPY.ADVISOR.ACTIVITY_TIMELINE.HIDE_DETAILS
            : UI_COPY.ADVISOR.ACTIVITY_TIMELINE.SHOW_DETAILS}
          <ChevronDown
            className={cn("fn-timeline-header-chevron", expanded && "is-open")}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Expanded Mode Tabs (Steps vs Live Terminal) */}
      {expanded && (
        <div className="fn-timeline-nav">
          <div className="fn-timeline-nav-tabs">
            <button
              type="button"
              onClick={() => setViewMode("steps")}
              className={cn("fn-timeline-nav-tab", viewMode === "steps" && "is-active")}
            >
              <ListTree className="fn-timeline-nav-tab-icon" />
              <span>
                {UI_COPY.ADVISOR.ACTIVITY_TIMELINE.ACTIVITY_STEP_COUNT(activities.length)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("logs")}
              className={cn("fn-timeline-nav-tab font-mono", viewMode === "logs" && "is-active")}
            >
              <Terminal className="fn-timeline-nav-tab-icon" />
              <span>{UI_COPY.ADVISOR.ACTIVITY_TIMELINE.LIVE_CONSOLE}</span>
              {logs.length > 0 && <span className="text-[10px] opacity-75">({logs.length})</span>}
              {isStreaming && <span className="size-1.5 rounded-full bg-primary animate-ping" />}
            </button>
          </div>
          <span className="text-muted-foreground text-[11px]">
            {isStreaming
              ? UI_COPY.ADVISOR.ACTIVITY_TIMELINE.STREAM_ACTIVE
              : UI_COPY.ADVISOR.ACTIVITY_TIMELINE.COMPLETE}
          </span>
        </div>
      )}

      {/* Steps or Live Terminal body */}
      {showRows && (
        <>
          {expanded && viewMode === "logs" ? (
            <div className="border-t border-border/40 bg-zinc-950/50 p-2">
              <LiveRunConsole logs={logs} isStreaming={isStreaming} />
            </div>
          ) : (
            <ul
              id="agent-activity-steps"
              aria-label={UI_COPY.ADVISOR.ACTIVITY_TIMELINE.EXECUTION_STEPS}
              className="fn-timeline-list border-t border-border/60 px-3.5 py-1.5"
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
