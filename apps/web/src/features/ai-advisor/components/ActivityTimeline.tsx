"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  ListTree,
  Loader2,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn, Shimmer } from "@fin-ai/ui";
import type { AgentActivity, AgentRunLogEntry } from "../api/agentTypes";
import { deriveRunState, formatDuration, standbyLabel } from "../utils/deriveRunState";
import { ActivityStepRow } from "./ActivityStepRow";
import { LiveRunConsole } from "./LiveRunConsole";
import { UI_COPY } from "@/lib/ui-copy";

const COLLAPSED_ROWS = 3;

interface ActivityTimelineProps {
  activities: AgentActivity[];
  logs?: AgentRunLogEntry[];
  reasoning?: string;
  reasoningStreaming?: boolean;
  reasoningStartedAt?: number;
  reasoningCompletedAt?: number;
  isStreaming: boolean;
  hasText?: boolean;
}

/**
 * Unified Copilot / Claude Code style execution & thinking block.
 * Combines live streamed reasoning, step timeline, and the real-time Terminal console
 * inside a single collapsible container (auto-expands during streaming, collapses to 1 line on completion).
 */
export function ActivityTimeline({
  activities,
  logs = [],
  reasoning = "",
  reasoningStreaming = false,
  reasoningStartedAt,
  reasoningCompletedAt,
  isStreaming,
  hasText = false,
}: ActivityTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"steps" | "logs">("steps");
  const reasoningScrollRef = useRef<HTMLDivElement>(null);
  const state = deriveRunState(activities, isStreaming);

  // Auto-scroll live reasoning stream
  useEffect(() => {
    if (reasoningStreaming && reasoningScrollRef.current) {
      reasoningScrollRef.current.scrollTop = reasoningScrollRef.current.scrollHeight;
    }
  }, [reasoning, reasoningStreaming]);

  const hasError = state.hasError;
  const hasRunningRow = activities.some((a) => a.status === "running");
  const latestLog = logs[logs.length - 1];

  const standby: AgentActivity | null =
    isStreaming && !expanded && !hasRunningRow && activities.length > 0
      ? { tool: "phase:standby", kind: "phase", status: "running", label: standbyLabel(hasText) }
      : null;

  const showRows = expanded || isStreaming;
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

  const handleToggle = () => {
    setExpanded((v) => !v);
  };

  return (
    <div className={cn("fn-timeline", isStreaming && "is-streaming")}>
      {/* Unified Header */}
      <button
        type="button"
        onClick={handleToggle}
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
            {isStreaming ? <Shimmer>{headerTitle}</Shimmer> : headerTitle}
          </span>
          {summaryMeta && <span className="fn-timeline-header-meta">{summaryMeta}</span>}
        </span>
        {isStreaming && !expanded && (
          <Loader2
            className="fn-timeline-header-icon fn-timeline-header-icon--streaming fn-icon-spin"
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

      {/* Expanded Mode Tabs (Thinking & Steps vs Live Console) */}
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
              className={cn("fn-timeline-nav-tab", viewMode === "logs" && "is-active")}
            >
              <Terminal className="fn-timeline-nav-tab-icon" />
              <span>{UI_COPY.ADVISOR.ACTIVITY_TIMELINE.LIVE_CONSOLE}</span>
              {logs.length > 0 && <span className="fn-timeline-log-count">({logs.length})</span>}
              {isStreaming && <span className="fn-timeline-ping-dot" />}
            </button>
          </div>
          <span className="fn-timeline-status-text">
            {isStreaming
              ? UI_COPY.ADVISOR.ACTIVITY_TIMELINE.STREAM_ACTIVE
              : UI_COPY.ADVISOR.ACTIVITY_TIMELINE.COMPLETE}
          </span>
        </div>
      )}

      {/* Unified Body: Live Reasoning + Steps OR Live Console */}
      {showRows && (
        <>
          {expanded && viewMode === "logs" ? (
            <div className="fn-timeline-console-wrap">
              <LiveRunConsole logs={logs} isStreaming={isStreaming} />
            </div>
          ) : (
            <div className="fn-timeline-body">
              {reasoning && (isStreaming || expanded) && (
                <div
                  ref={reasoningScrollRef}
                  className={cn("fn-timeline-reasoning", isStreaming && "is-streaming")}
                >
                  <div className="fn-timeline-reasoning-label">
                    <Brain className="fn-timeline-reasoning-icon" aria-hidden="true" />
                    <span>
                      {reasoningStreaming ? (
                        <Shimmer>{latestLog?.message || state.statusLabel}</Shimmer>
                      ) : reasoningStartedAt && reasoningCompletedAt ? (
                        `Thought for ${formatDuration(reasoningCompletedAt - reasoningStartedAt)}`
                      ) : (
                        `Thought process · ${reasoning.trim().split(/\s+/).length} words`
                      )}
                    </span>
                  </div>
                  <p className="fn-timeline-reasoning-text">{reasoning}</p>
                </div>
              )}

              {visible.length > 0 && (
                <ul
                  id="agent-activity-steps"
                  aria-label={UI_COPY.ADVISOR.ACTIVITY_TIMELINE.EXECUTION_STEPS}
                  className="fn-timeline-list is-bordered"
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
