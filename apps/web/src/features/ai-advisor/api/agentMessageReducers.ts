import type {
  AgentActivity,
  AgentChatMessage,
  AgentConfirmation,
  AgentConfirmationStatus,
  AgentResolvedMode,
  AgentRunLogEntry,
} from "./agentTypes";

/** Pure state helpers for useAgentMessages, keeping hook files under 250 lines. */

export function appendLogReducer(
  prev: AgentChatMessage[],
  log: AgentRunLogEntry,
): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant") return prev;
  copy[copy.length - 1] = {
    ...last,
    logs: [...(last.logs ?? []), log],
  };
  return copy;
}

export function appendTextReducer(prev: AgentChatMessage[], content: string): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant") return prev;
  copy[copy.length - 1] = { ...last, text: last.text + content };
  return copy;
}

export function replaceTextReducer(prev: AgentChatMessage[], content: string): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant") return prev;
  copy[copy.length - 1] = { ...last, text: content };
  return copy;
}

export function appendActivityReducer(
  prev: AgentChatMessage[],
  activity: AgentActivity,
): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant") return prev;
  copy[copy.length - 1] = {
    ...last,
    activities: [...(last.activities ?? []), { ...activity, startedAt: Date.now() }],
  };
  return copy;
}

export function updateActivityReducer(
  prev: AgentChatMessage[],
  tool: string,
  patch: Partial<AgentActivity>,
): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant") return prev;
  const activities = (last.activities ?? []).slice();
  for (let i = activities.length - 1; i >= 0; i--) {
    if (activities[i].tool === tool) {
      const isCompleting =
        activities[i].status === "running" && patch.status && patch.status !== "running";
      activities[i] = {
        ...activities[i],
        ...patch,
        ...(isCompleting && !activities[i].completedAt ? { completedAt: Date.now() } : {}),
      };
      break;
    }
  }
  copy[copy.length - 1] = { ...last, activities };
  return copy;
}

export function appendConfirmationReducer(
  prev: AgentChatMessage[],
  confirmation: AgentConfirmation,
): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant") return prev;
  copy[copy.length - 1] = {
    ...last,
    confirmations: [...(last.confirmations ?? []), confirmation],
  };
  return copy;
}

export function updateConfirmationStatusReducer(
  prev: AgentChatMessage[],
  actionId: string,
  status: AgentConfirmationStatus,
): AgentChatMessage[] {
  return prev.map((m) =>
    m.confirmations?.some((c) => c.actionId === actionId)
      ? {
          ...m,
          confirmations: m.confirmations.map((c) =>
            c.actionId === actionId ? { ...c, status } : c,
          ),
        }
      : m,
  );
}

export function updateConfirmationCardReducer(
  prev: AgentChatMessage[],
  actionId: string,
  card: import("@finai/ai-engine").AgentCard,
  tool?: string,
): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const lastIdx = prev.length - 1;
  const lastMsg = prev[lastIdx];

  let existing: AgentConfirmation | undefined;
  for (const m of prev) {
    const found = m.confirmations?.find((c) => c.actionId === actionId);
    if (found) {
      existing = found;
      break;
    }
  }

  const updated: AgentConfirmation = {
    actionId,
    tool: tool ?? existing?.tool ?? "transaction.create_bulk",
    card,
    status: existing?.status ?? "pending",
  };

  if (lastMsg?.role === "assistant") {
    return prev.map((m, idx) => {
      const rest = (m.confirmations ?? []).filter((c) => c.actionId !== actionId);
      return idx === lastIdx
        ? { ...m, confirmations: [...rest, updated] }
        : { ...m, confirmations: rest };
    });
  }

  return prev.map((m) =>
    m.confirmations?.some((c) => c.actionId === actionId)
      ? {
          ...m,
          confirmations: m.confirmations.map((c) => (c.actionId === actionId ? updated : c)),
        }
      : m,
  );
}

export function resolveApprovalActivityReducer(
  prev: AgentChatMessage[],
  actionId: string,
  patch: Partial<AgentActivity>,
): AgentChatMessage[] {
  const key = `approval:${actionId}`;
  return prev.map((m) =>
    m.activities?.some((a) => a.tool === key)
      ? {
          ...m,
          activities: m.activities.map((a) =>
            a.tool === key
              ? {
                  ...a,
                  ...patch,
                  ...(a.status === "running" &&
                  patch.status &&
                  patch.status !== "running" &&
                  !a.completedAt
                    ? { completedAt: Date.now() }
                    : {}),
                }
              : a,
          ),
        }
      : m,
  );
}

export function failStreamReducer(prev: AgentChatMessage[], errorText: string): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant") return prev;
  const activities = (last.activities ?? []).map((a) =>
    a.status === "running"
      ? {
          ...a,
          status: "error" as const,
          summary: a.summary ?? "Interrupted",
          completedAt: a.completedAt ?? Date.now(),
        }
      : a,
  );
  copy[copy.length - 1] = {
    ...last,
    activities,
    error: errorText,
    streaming: false,
  };
  return copy;
}

export function endStreamReducer(prev: AgentChatMessage[]): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant" || !last.streaming) return prev;
  copy[copy.length - 1] = { ...last, streaming: false };
  return copy;
}

/** Records which runtime answered the current assistant turn (SSE `mode` event). */
export function setModeReducer(
  prev: AgentChatMessage[],
  mode: AgentResolvedMode,
): AgentChatMessage[] {
  if (prev.length === 0) return prev;
  const copy = [...prev];
  const last = copy[copy.length - 1];
  if (!last || last.role !== "assistant") return prev;
  copy[copy.length - 1] = { ...last, mode };
  return copy;
}
