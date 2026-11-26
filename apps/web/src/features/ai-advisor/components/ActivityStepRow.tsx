"use client";

import {
  ArrowLeftRight,
  BarChart3,
  Brain,
  Check,
  Database,
  Loader2,
  PiggyBank,
  Search,
  ShieldCheck,
  Tag,
  Target,
  TrendingUp,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { cn, Shimmer } from "@fin-ai/ui";
import { AgentActivityKind, AgentActivityStatus, AgentToolNamespace } from "@fin-ai/shared-types";
import type { AgentActivity } from "../api/agentTypes";
import { activityLabel, formatDuration } from "../utils/deriveRunState";

interface ActivityStepRowProps {
  activity: AgentActivity;
  /** Expanded rows also show the summary/detail line and step duration. */
  expanded?: boolean;
  /** The row the agent is currently working on (strongest visual weight). */
  isCurrent?: boolean;
}

/** Picks a Copilot-style contextual Lucide icon for each step/tool category. */
function StepContextIcon({ activity }: { activity: AgentActivity }) {
  const cls = "fn-timeline-header-icon fn-timeline-header-icon--pending";
  if (activity.kind === AgentActivityKind.APPROVAL) {
    return <ShieldCheck className={cls} aria-hidden="true" />;
  }
  if (activity.kind === AgentActivityKind.PHASE) {
    if (activity.tool.startsWith("phase:loading_context")) {
      return <Database className={cls} aria-hidden="true" />;
    }
    return <Brain className={cls} aria-hidden="true" />;
  }
  const ns = activity.tool.split(".")[0];
  switch (ns) {
    case AgentToolNamespace.ACCOUNTS:
      return <Wallet className={cls} aria-hidden="true" />;
    case AgentToolNamespace.TRANSACTIONS:
      return <ArrowLeftRight className={cls} aria-hidden="true" />;
    case AgentToolNamespace.ANALYTICS:
    case AgentToolNamespace.INSIGHTS:
      return <BarChart3 className={cls} aria-hidden="true" />;
    case AgentToolNamespace.SEARCH:
      return <Search className={cls} aria-hidden="true" />;
    case AgentToolNamespace.BUDGETS:
      return <PiggyBank className={cls} aria-hidden="true" />;
    case AgentToolNamespace.GOALS:
      return <Target className={cls} aria-hidden="true" />;
    case AgentToolNamespace.INVESTMENTS:
      return <TrendingUp className={cls} aria-hidden="true" />;
    case AgentToolNamespace.CATEGORIES:
      return <Tag className={cls} aria-hidden="true" />;
    default:
      return <Wrench className={cls} aria-hidden="true" />;
  }
}

/** Icon per real activity state: contextual icon when pending, spinner while running, ✓/✕ on completion. */
function StatusIcon({ activity }: { activity: AgentActivity }) {
  if (activity.status === AgentActivityStatus.SUCCESS) {
    return (
      <Check
        className="fn-timeline-header-icon fn-timeline-header-icon--muted"
        aria-hidden="true"
      />
    );
  }
  if (activity.status === AgentActivityStatus.RUNNING) {
    return (
      <Loader2
        className="fn-timeline-header-icon fn-timeline-header-icon--streaming fn-icon-spin"
        aria-hidden="true"
      />
    );
  }
  if (activity.status === AgentActivityStatus.ERROR) {
    return (
      <X className="fn-timeline-header-icon fn-timeline-header-icon--error" aria-hidden="true" />
    );
  }
  return <StepContextIcon activity={activity} />;
}

/**
 * One row of the live activity stream. Uses contextual Copilot-style icons and Shimmer
 * on active steps while resolving labels through `activityLabel`.
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
        <StatusIcon activity={activity} />
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
          {activity.status === AgentActivityStatus.RUNNING ? (
            <Shimmer>{`${activityLabel(activity)}…`}</Shimmer>
          ) : (
            activityLabel(activity)
          )}
        </span>
        {expanded && detail && activity.status !== AgentActivityStatus.RUNNING && (
          <span className="fn-timeline-item-detail">{detail}</span>
        )}
      </span>
      {expanded && duration && <span className="fn-timeline-item-duration">{duration}</span>}
    </li>
  );
}
