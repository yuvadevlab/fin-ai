"use client";

import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@fin-ai/ui";
import { AgentActivityStatus } from "@fin-ai/shared-types";
import type { AgentActivity } from "../api/agentTypes";
import { activityLabel, formatDuration } from "../utils/deriveRunState";

interface ActivityStepRowProps {
  activity: AgentActivity;
  /** Expanded rows also show the summary/detail line and step duration. */
  expanded?: boolean;
  /** The row the agent is currently working on (strongest visual weight). */
  isCurrent?: boolean;
}

/** Icon per real activity state: ✓ completed · ◌ running · ○ pending · ✕ failed. */
function StatusIcon({ status }: { status: AgentActivityStatus }) {
  if (status === AgentActivityStatus.SUCCESS) {
    return (
      <Check
        className="fn-timeline-header-icon fn-timeline-header-icon--muted"
        aria-hidden="true"
      />
    );
  }
  if (status === AgentActivityStatus.RUNNING) {
    return (
      <Loader2
        className="fn-timeline-header-icon fn-timeline-header-icon--streaming fn-icon-spin"
        aria-hidden="true"
      />
    );
  }
  if (status === AgentActivityStatus.ERROR) {
    return (
      <X className="fn-timeline-header-icon fn-timeline-header-icon--error" aria-hidden="true" />
    );
  }
  return (
    <Circle
      className="fn-timeline-header-icon fn-timeline-header-icon--pending"
      aria-hidden="true"
    />
  );
}

/**
 * One row of the live activity stream. The label always comes from the
 * centralized mapper (`activityLabel`) — user-safe wording, no tool names,
 * no internal details, no chain-of-thought. Running rows end with an
 * ellipsis so the current operation reads as in-progress.
 */
export function ActivityStepRow({
  activity,
  expanded = false,
  isCurrent = false,
}: ActivityStepRowProps) {
  const duration =
    activity.startedAt && activity.completedAt
      ? formatDuration(activity.completedAt - activity.startedAt)
      : null;
  const detail = activity.summary ?? activity.detail;

  return (
    <li
      className={cn("fn-timeline-item", isCurrent && "is-current")}
      aria-current={isCurrent ? "step" : undefined}
    >
      <span className="fn-timeline-status-icon-box">
        <StatusIcon status={activity.status} />
      </span>
      <span className="fn-timeline-item-content">
        <span
          className={cn(
            "fn-timeline-item-title",
            activity.status === AgentActivityStatus.RUNNING && "fn-timeline-item-title--running",
            activity.status === AgentActivityStatus.SUCCESS && "fn-timeline-item-title--success",
            activity.status === AgentActivityStatus.ERROR && "fn-timeline-item-title--error",
            activity.status === AgentActivityStatus.PENDING && "fn-timeline-item-title--pending",
          )}
        >
          {activityLabel(activity)}
          {activity.status === AgentActivityStatus.RUNNING ? "…" : ""}
        </span>
        {expanded && detail && activity.status !== AgentActivityStatus.RUNNING && (
          <span className="fn-timeline-item-detail">{detail}</span>
        )}
      </span>
      {expanded && duration && <span className="fn-timeline-item-duration">{duration}</span>}
    </li>
  );
}
