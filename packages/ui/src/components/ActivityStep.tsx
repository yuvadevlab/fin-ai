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
    return (
      <Check
        className="fn-timeline-status-icon fn-timeline-status-icon--success"
        aria-hidden="true"
      />
    );
  }
  if (status === "running") {
    return (
      <Loader2
        className="fn-timeline-status-icon fn-timeline-status-icon--running"
        aria-hidden="true"
      />
    );
  }
  if (status === "error") {
    return (
      <X className="fn-timeline-status-icon fn-timeline-status-icon--error" aria-hidden="true" />
    );
  }
  return (
    <Circle
      className="fn-timeline-status-icon fn-timeline-status-icon--pending"
      aria-hidden="true"
    />
  );
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
      className={cn("fn-timeline-item", isCurrent && "fn-timeline-item--current")}
      aria-current={isCurrent ? "step" : undefined}
    >
      <span className="fn-timeline-item-icon">
        <StatusIcon status={step.status} />
      </span>
      <span className="fn-timeline-item-content">
        <span
          className={cn(
            "fn-timeline-item-title",
            step.status === "running" && "fn-timeline-item-title--running",
            step.status === "success" && "fn-timeline-item-title--success",
            step.status === "error" && "fn-timeline-item-title--error",
            step.status === "pending" && "fn-timeline-item-title--pending",
          )}
        >
          {step.label}
          {step.status === "running" ? "…" : ""}
        </span>
        {expanded && step.detail && step.status !== "running" && (
          <span className="fn-timeline-item-detail">{step.detail}</span>
        )}
      </span>
      {expanded && step.duration && (
        <span className="fn-timeline-item-duration">{step.duration}</span>
      )}
    </li>
  );
}
