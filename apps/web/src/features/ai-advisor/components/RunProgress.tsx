"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@finai/ui";
import type { AgentActivity } from "../api/agentTypes";
import { AgentActivity as AgentActivityItem } from "./AgentActivity";
import { deriveRunState } from "../utils/deriveRunState";

interface RunProgressProps {
  activities: AgentActivity[];
  isStreaming: boolean;
  /** Compact mode renders a single-line status instead of the full step list. */
  compact?: boolean;
}

/**
 * Extracts human-readable data-source references from the run's completed
 * read-tool activities. These are shown as a "Based on" line so the user
 * knows where the agent got its information (e.g. "3 accounts, 15 transactions").
 */
function extractReferences(activities: AgentActivity[]): string[] {
  const refMap: Record<string, string> = {};
  for (const a of activities) {
    if (a.status !== "success" || !a.summary) continue;
    // Map tool prefixes to friendly source labels.
    const prefix = a.tool.split(".")[0];
    // Only include read tools (skip write tools like create/update/delete).
    if (
      a.tool.match(
        /\.(list|get|summarize|resolve|dashboard|healthScore|monthlyCashFlow|recommendations|safeToSpend|everything)$/,
      )
    ) {
      refMap[prefix] = a.summary;
    }
  }
  // Deduplicate and order consistently.
  const order = [
    "accounts",
    "transactions",
    "categories",
    "budgets",
    "goals",
    "investments",
    "analytics",
    "insights",
    "profile",
    "search",
  ];
  return order.filter((k) => refMap[k]).map((k) => refMap[k]);
}

/**
 * Groups an assistant turn's tool activity into a single collapsible
 * "run" block so the user sees "what the agent did" as a coherent story
 * rather than scattered chips.
 *
 * Header shows an aggregate status (sparkle + live label + step count), and
 * the body lists each tool call as a numbered step with its outcome. The
 * active step pulses subtly; resolved steps fade in with a check. A progress
 * bar fills as steps complete, and a "Based on" line shows data sources.
 */
export function RunProgress({ activities, isStreaming, compact = false }: RunProgressProps) {
  const state = deriveRunState(activities, isStreaming);

  // Don't render an empty progress block when the run produced no tool calls.
  if (state.totalCount === 0 && state.isComplete) return null;

  const progress = state.totalCount > 0 ? (state.completedCount / state.totalCount) * 100 : 0;
  const references = extractReferences(activities);

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
          state.isActive
            ? "bg-primary/5 text-primary border-primary/20"
            : "bg-muted/40 text-muted-foreground border-border/60",
        )}
      >
        <Sparkles className={cn("size-3", state.isActive && "animate-pulse")} aria-hidden="true" />
        <span className="font-medium">{state.statusLabel}</span>
        {state.totalCount > 0 && (
          <span className="text-muted-foreground tabular-nums">
            {state.completedCount}/{state.totalCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border-border/50 overflow-hidden rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <div className="relative">
          <Sparkles
            className={cn("text-primary size-4 shrink-0", state.isActive && "animate-pulse")}
            aria-hidden="true"
          />
          {state.isActive && (
            <span className="bg-primary/60 absolute -top-0.5 -right-0.5 size-1.5 animate-ping rounded-full" />
          )}
        </div>
        <span className="text-foreground text-sm font-semibold">{state.statusLabel}</span>
        {state.totalCount > 0 && (
          <span className="text-muted-foreground text-xs tabular-nums">
            {" "}
            · {state.completedCount}/{state.totalCount} steps
          </span>
        )}
      </div>

      {/* Speed runner progress bar */}
      {state.totalCount > 0 && (
        <div className="bg-foreground/[0.03] h-0.5 w-full">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              state.isActive
                ? "from-primary/60 via-primary to-primary/60 animate-[shimmer_2s_infinite_linear] bg-gradient-to-r bg-[length:200%_100%]"
                : "bg-primary",
            )}
            style={{ width: `${state.isComplete ? 100 : progress}%` }}
          />
        </div>
      )}

      {/* Step list */}
      {state.totalCount > 0 && (
        <div className="border-border/40 border-t px-2 py-1.5">
          <div className="space-y-0.5">
            {activities.map((activity, idx) => (
              <AgentActivityItem
                key={`${activity.tool}-${idx}`}
                activity={activity}
                stepNumber={idx + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Data references */}
      {references.length > 0 && state.isComplete && (
        <div className="border-border/40 bg-foreground/[0.02] border-t px-3.5 py-2">
          <p className="text-muted-foreground text-[11px] font-medium">
            <span className="text-primary/70">◆</span> Based on: {references.join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
