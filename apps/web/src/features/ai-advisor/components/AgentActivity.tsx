"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@finai/ui";
import type { AgentActivity } from "../api/agentTypes";

interface AgentActivityProps {
  activity: AgentActivity;
  stepNumber: number;
}

/**
 * A single step inside a run progress block. Renders a status icon
 * (spinning loader / check / X), the step number, a user-safe tool label,
 * and an optional one-line summary from the server.
 *
 * The raw tool name (e.g. "accounts.list") is shown as a faint technical
 * detail — the human-readable label is what the user scans. The active step
 * has a subtle background pulse; resolved steps transition smoothly.
 */
export function AgentActivity({ activity, stepNumber }: AgentActivityProps) {
  const Icon =
    activity.status === "running"
      ? Loader2
      : activity.status === "success"
        ? CheckCircle2
        : XCircle;

  const isRunning = activity.status === "running";

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all duration-300",
        isRunning && "bg-primary/5",
        activity.status === "success" && "bg-transparent",
        activity.status === "error" && "bg-destructive/5",
      )}
    >
      {/* Step indicator */}
      <div className="flex size-5 shrink-0 items-center justify-center">
        <Icon
          className={cn(
            "text-muted-foreground size-4 transition-colors duration-300",
            isRunning && "text-primary animate-spin",
            activity.status === "success" && "text-emerald-500",
            activity.status === "error" && "text-destructive",
          )}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium tabular-nums">
          {stepNumber}.
        </span>
        <span
          className={cn(
            "truncate font-medium transition-colors duration-300",
            isRunning ? "text-foreground" : "text-muted-foreground",
            activity.status === "error" && "text-destructive",
          )}
        >
          {activity.summary ?? activity.tool}
        </span>
        {activity.summary && activity.summary !== activity.tool && (
          <span className="text-muted-foreground truncate text-xs">{activity.tool}</span>
        )}
      </div>
    </div>
  );
}
