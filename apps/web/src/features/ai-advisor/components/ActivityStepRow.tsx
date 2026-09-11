"use client";

import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@finai/ui";
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
function StatusIcon({ status }: { status: AgentActivity["status"] }) {
  if (status === "success") {
    return <Check className="text-muted-foreground size-3.5" aria-hidden="true" />;
  }
  if (status === "running") {
    return (
      <Loader2
        className="text-primary motion-safe:size-3.5 motion-safe:animate-spin"
        aria-hidden="true"
      />
    );
  }
  if (status === "error") {
    return <X className="text-destructive size-3.5" aria-hidden="true" />;
  }
  return <Circle className="text-muted-foreground/50 size-3" aria-hidden="true" />;
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
      className={cn("flex items-start gap-2.5 py-1", isCurrent && "bg-primary/5 rounded-md")}
      aria-current={isCurrent ? "step" : undefined}
    >
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
        <StatusIcon status={activity.status} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[13px] leading-5",
            activity.status === "running" && "text-foreground font-medium",
            activity.status === "success" && "text-muted-foreground",
            activity.status === "error" && "text-destructive font-medium",
            activity.status === "pending" && "text-muted-foreground/70",
          )}
        >
          {activityLabel(activity)}
          {activity.status === "running" ? "…" : ""}
        </span>
        {expanded && detail && activity.status !== "running" && (
          <span className="text-muted-foreground/80 mt-0.5 block text-xs leading-4">{detail}</span>
        )}
      </span>
      {expanded && duration && (
        <span className="text-muted-foreground/70 mt-0.5 shrink-0 font-mono text-[11px]">
          {duration}
        </span>
      )}
    </li>
  );
}
