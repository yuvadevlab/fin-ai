import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "../lib/utils";

export type StepStatus = "pending" | "running" | "success" | "error";

export interface ActivityStepData {
  /** Stable key for the step (used as React key). */
  id: string;
  status: StepStatus;
  /** User-safe label shown as the primary text. */
  label: string;
  /** Optional secondary detail (shown expanded). */
  detail?: string;
  /** Optional formatted duration (shown expanded). */
  duration?: string;
}

export interface ActivityStepProps {
  step: ActivityStepData;
  /** Expanded rows show detail + duration. */
  expanded?: boolean;
  /** The step the agent is currently working on (strongest visual weight). */
  isCurrent?: boolean;
}

/** Status icon: ✓ completed · ◌ running · ○ pending · ✕ failed. */
function StatusIcon({ status }: { status: StepStatus }) {
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
 * One row of an activity/timeline step list.
 *
 * Shows a status icon, a user-safe label, and — when expanded — an optional
 * detail line and duration. The `isCurrent` row gets a subtle highlight and
 * `aria-current="step"` for accessibility.
 *
 * Extracted from the AI Advisor's `ActivityStepRow` so any feature can render
 * a step-by-step process (builds, deployments, migrations, etc.).
 */
export function ActivityStep({ step, expanded = false, isCurrent = false }: ActivityStepProps) {
  return (
    <li
      className={cn("flex items-start gap-2.5 py-1", isCurrent && "bg-primary/5 rounded-md")}
      aria-current={isCurrent ? "step" : undefined}
    >
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
        <StatusIcon status={step.status} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[13px] leading-5",
            step.status === "running" && "text-foreground font-medium",
            step.status === "success" && "text-muted-foreground",
            step.status === "error" && "text-destructive font-medium",
            step.status === "pending" && "text-muted-foreground/70",
          )}
        >
          {step.label}
          {step.status === "running" ? "…" : ""}
        </span>
        {expanded && step.detail && step.status !== "running" && (
          <span className="text-muted-foreground/80 mt-0.5 block text-xs leading-4">
            {step.detail}
          </span>
        )}{" "}
      </span>
      {expanded && step.duration && (
        <span className="text-muted-foreground/70 mt-0.5 shrink-0 font-mono text-[11px]">
          {step.duration}
        </span>
      )}
    </li>
  );
}
