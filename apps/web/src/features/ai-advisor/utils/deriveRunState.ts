import type { AgentActivity } from "../api/agentTypes";

/**
 * Derives the aggregate state of a single agent run from its accumulated
 * activities. This is the single source of truth for what the run progress
 * UI shows (running / partial / done / has errors).
 *
 * One assistant message === one run. Each run has N activities (tool calls).
 * The run is "done" only when every activity has resolved and the stream has
 * finished (no streaming flag).
 */
export interface RunState {
  /** True while at least one activity is still running. */
  isActive: boolean;
  /** True when the stream is finished and every activity resolved. */
  isComplete: boolean;
  /** True when one or more activities ended in error. */
  hasError: boolean;
  /** Number of activities that have resolved (success or error). */
  completedCount: number;
  /** Total number of activities in this run. */
  totalCount: number;
  /** The most recent running activity's tool name, for the status label. */
  currentTool: string | null;
  /** Short label describing what the agent is currently doing. */
  statusLabel: string;
  /** Total run duration in milliseconds (from first start to last completion). */
  durationMs: number | null;
}

/** Human-friendly, user-safe label for a tool call (no internal names). */
const TOOL_LABELS: Record<string, string> = {
  "accounts.list": "Reviewing your accounts",
  "accounts.get": "Fetching account details",
  "analytics.dashboard": "Analyzing your finances",
  "analytics.healthScore": "Calculating your financial health",
  "analytics.monthlyCashFlow": "Analyzing monthly cash flow",
  "analytics.recommendations": "Generating recommendations",
  "search.everything": "Searching your finances",
  "transactions.list": "Reviewing transactions",
  "transactions.summarize": "Summarizing transactions",
  "transactions.recategorize": "Analyzing categories",
  "transactions.recategorizeApply": "Re-categorizing transactions",
  "categories.list": "Reviewing categories",
  "categories.resolve": "Resolving category",
  "budgets.list": "Reviewing budgets",
  "goals.list": "Reviewing goals",
  "investments.list": "Reviewing investments",
  "insights.safeToSpend": "Calculating safe-to-spend",
  "profile.get": "Loading your profile",
};

/** Returns a stable user-safe label for a tool, falling back gracefully. */
function toolLabel(tool: string): string {
  if (TOOL_LABELS[tool]) return TOOL_LABELS[tool];
  // Strip the "accounts." prefix for write tools → "Creating your account", etc.
  const parts = tool.split(".");
  if (parts.length === 2) {
    const verb = parts[1];
    const verbs: Record<string, string> = {
      create: "Creating",
      update: "Updating",
      delete: "Deleting",
      rename: "Renaming",
      contribute: "Contributing to",
      transferAllocation: "Transferring",
      setDefaultAccount: "Updating",
      updateValue: "Updating",
      bulkCreate: "Recording",
      get: "Fetching",
      resolve: "Resolving",
      list: "Reviewing",
      summarize: "Summarizing",
    };
    const noun = parts[0].replace(/s$/, "");
    return `${verbs[verb] ?? "Working on"} your ${noun}`;
  }
  return "Working";
}

/**
 * Centralized event → user-safe activity mapping (requirement: "activity
 * mapping layer"). Every activity row in the UI resolves its label through
 * this function — never inline maps inside components.
 *
 * Activity `tool` values are synthetic keys for non-tool activity:
 *   - "phase:agent_started"            — the run began (from the real `run`
 *                                        event); reads as "Understanding your
 *                                        question"
 *   - "phase:loading_context"          — server is assembling context
 *   - "phase:model_turn:<n>"           — LLM inference round n
 *   - "phase:model_turn:<n>:pending"       — inference while an action awaits
 *                                            confirmation (turn 1 reads as a
 *                                            correction to that action)
 *   - "approval"                           — waiting for the user to confirm
 * `activity.label` (set at event time, e.g. "Prepared your response") always
 * wins when present.
 */
export function activityLabel(activity: AgentActivity): string {
  if (activity.label) return activity.label;
  if (activity.kind === "approval") return "Waiting for your approval";
  if (activity.kind === "phase") {
    // phaseKey() appends the turn suffix (":0" when absent), so match by prefix.
    if (activity.tool.startsWith("phase:agent_started")) return "Understanding your question";
    if (activity.tool.startsWith("phase:loading_context")) return "Loading your financial context";
    const match = activity.tool.match(/^phase:model_turn:(\d+)/);
    if (match) {
      const isPendingContext = activity.tool.endsWith(":pending");
      if (Number(match[1]) <= 1) {
        return isPendingContext ? "Understanding your correction" : "Understanding your request";
      }
      return "Thinking through the next step";
    }
    return "Working";
  }
  return toolLabel(activity.tool);
}

/**
 * Formats a millisecond duration into a human-readable string.
 * 800 → "0.8s", 4500 → "4.5s", 65000 → "1m 5s".
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}m ${sec}s`;
}

/**
 * User-safe label for the collapsed-view standby row. While the SSE stream is
 * open and no real event is currently running (gap between tool steps, or the
 * final answer tokens are streaming), the timeline keeps one truthful
 * "current operation" row visible instead of a stale fully-ticked checklist.
 *
 * `hasText` is true once the final answer has started streaming, which is the
 * only point where "Streaming your answer" is factually accurate.
 */
export function standbyLabel(hasText: boolean): string {
  return hasText ? "Streaming your answer" : "FinAI is working";
}

/**
 * Computes the run state for an assistant message's activities.
 *
 * @param activities - Accumulated tool activities for one run.
 * @param isStreaming - Whether the assistant turn is still streaming.
 */
export function deriveRunState(
  activities: AgentActivity[] | undefined,
  isStreaming: boolean | undefined,
): RunState {
  const list = activities ?? [];
  const totalCount = list.length;
  const completedCount = list.filter((a) => a.status === "success" || a.status === "error").length;
  const running = list.filter((a) => a.status === "running");
  const hasError = list.some((a) => a.status === "error");
  const isActive = running.length > 0 || !!isStreaming;

  // The stream is "complete" only when it has finished AND all tools resolved.
  const allResolved = totalCount > 0 && completedCount === totalCount;
  const isComplete = !isStreaming && (allResolved || totalCount === 0);

  // The currently running step (last in order) drives the "what is FinAI
  // doing right now?" label; its label comes from the centralized mapper so
  // phases ("◌ Understanding your request…") read naturally.
  const current = running.length > 0 ? running[running.length - 1] : null;
  const currentTool = current?.tool ?? null;

  let statusLabel: string;
  if (isActive && current) {
    statusLabel = activityLabel(current);
  } else if (isActive) {
    // Nothing has started yet (or no steps at all) — the honest label is
    // "thinking", not a fabricated milestone.
    statusLabel = totalCount === 0 ? "FinAI is thinking…" : "FinAI is working…";
  } else if (isComplete && hasError) {
    statusLabel = "Finished with some issues";
  } else if (isComplete) {
    statusLabel = "Done";
  } else {
    statusLabel = "Working on it…";
  }

  // Compute total run duration from first start to last completion.
  const timestamps = list.flatMap((a) => [a.startedAt, a.completedAt].filter(Boolean)) as number[];
  let durationMs: number | null = null;
  if (timestamps.length >= 2) {
    durationMs = Math.max(...timestamps) - Math.min(...timestamps);
  } else if (timestamps.length === 1 && !isStreaming) {
    durationMs = Date.now() - timestamps[0];
  }

  return {
    isActive,
    isComplete,
    hasError,
    completedCount,
    totalCount,
    currentTool,
    statusLabel,
    durationMs,
  };
}
