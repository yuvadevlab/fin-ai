"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@finai/ui";
import type { AgentActivity } from "../api";

/**
 * Compact inline chip that surfaces an agent tool call's live status to the
 * user. A spinning loader indicates a running tool, a check mark indicates
 * success, and an X indicates an error. An optional one-line summary (e.g.
 * "Retrieved 3 accounts") is shown alongside the tool name when available.
 */
export function AgentActivityChip({ activity }: { activity: AgentActivity }) {
  const Icon =
    activity.status === "running"
      ? Loader2
      : activity.status === "success"
        ? CheckCircle2
        : XCircle;

  return (
    <span
      title={activity.summary ?? `${activity.tool} finished`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        activity.status === "running" && "bg-primary/10 text-primary border-primary/20",
        activity.status === "success" && "bg-foreground/5 text-muted-foreground border-border",
        activity.status === "error" && "bg-destructive/15 text-destructive border-destructive/20",
      )}
    >
      <Icon
        className={cn("size-3", activity.status === "running" && "animate-spin")}
        aria-hidden="true"
      />
      <span>{activity.tool}</span>
      {activity.summary && activity.status !== "running" ? (
        <span className="text-muted-foreground max-w-48 truncate opacity-80">
          · {activity.summary}
        </span>
      ) : null}
    </span>
  );
}
