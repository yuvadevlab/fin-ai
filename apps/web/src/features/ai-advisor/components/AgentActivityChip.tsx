"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@fin-ai/ui";
import { UI_COPY } from "@/lib/ui-copy";
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
      title={activity.summary ?? UI_COPY.ADVISOR.ACTIVITY_CHIP.FINISHED(activity.tool)}
      className={cn(
        "fn-agent-chip",
        activity.status === "running" && "is-running",
        activity.status === "success" && "is-success",
        activity.status === "error" && "is-error",
      )}
    >
      <Icon
        className={cn("fn-agent-chip-icon", activity.status === "running" && "is-spinning")}
        aria-hidden="true"
      />
      <span>{activity.tool}</span>
      {activity.summary && activity.status !== "running" ? (
        <span className="fn-agent-chip-summary">· {activity.summary}</span>
      ) : null}
    </span>
  );
}
