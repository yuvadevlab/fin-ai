import type { AiConversation, AiMessage } from "./useConversations";
import type { AgentActionHistoryItem } from "./agentActions";
import type { AgentChatMessage, AgentConfirmation } from "./agentTypes";

/**
 * Hydrates stored conversation messages with their corresponding action confirmation cards.
 *
 * Resolves each action to the specific assistant message turn where it was proposed:
 * 1. Exact match via `message.metadata.actionIds` if available.
 * 2. Chronological turn matching: any action proposed between the previous assistant message
 *    (or turn start) and the subsequent user turn belongs to this assistant turn.
 * 3. Graceful fallback to the last assistant message if timestamps are absent.
 */
export function hydrateConversationMessages(
  convo: AiConversation,
  actions: AgentActionHistoryItem[],
): AgentChatMessage[] {
  const storedMessages: AiMessage[] = convo.messages ?? [];
  if (storedMessages.length === 0) return [];

  const baseMessages: AgentChatMessage[] = storedMessages.map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    text: m.content,
  }));

  if (!actions || actions.length === 0) {
    return baseMessages;
  }

  // Find all assistant message indices
  const assistantIndices: number[] = [];
  for (let i = 0; i < storedMessages.length; i++) {
    if (storedMessages[i].role === "ASSISTANT") {
      assistantIndices.push(i);
    }
  }

  if (assistantIndices.length === 0) {
    return baseMessages;
  }

  // If there's only 1 assistant message, all actions naturally belong to it
  if (assistantIndices.length === 1) {
    const targetIdx = assistantIndices[0];
    baseMessages[targetIdx] = {
      ...baseMessages[targetIdx],
      confirmations: actions.map(toAgentConfirmation),
    };
    return baseMessages;
  }

  // Map each assistant turn to its action time interval
  const turns = assistantIndices.map((idx, pos) => {
    const msg = storedMessages[idx];
    const prevAssistantIdx = pos > 0 ? assistantIndices[pos - 1] : -1;
    const startWindow =
      prevAssistantIdx >= 0 ? new Date(storedMessages[prevAssistantIdx].createdAt).getTime() : 0;

    const nextAssistantIdx = pos < assistantIndices.length - 1 ? assistantIndices[pos + 1] : -1;
    let endWindow = Infinity;
    if (nextAssistantIdx > 0) {
      for (let j = idx + 1; j <= nextAssistantIdx; j++) {
        if (storedMessages[j].role === "USER") {
          endWindow = new Date(storedMessages[j].createdAt).getTime();
          break;
        }
      }
      if (endWindow === Infinity) {
        endWindow = new Date(storedMessages[nextAssistantIdx].createdAt).getTime();
      }
    }

    const explicitActionIds = new Set(msg.metadata?.actionIds ?? []);

    return {
      messageIndex: idx,
      startWindow,
      endWindow,
      explicitActionIds,
      confirmations: [] as AgentConfirmation[],
    };
  });

  const unassigned: AgentConfirmation[] = [];

  for (const action of actions) {
    const confirmation = toAgentConfirmation(action);

    // 1. Try explicit action ID match first
    const explicitTurn = turns.find((t) => t.explicitActionIds.has(action.actionId));
    if (explicitTurn) {
      explicitTurn.confirmations.push(confirmation);
      continue;
    }

    // 2. Try chronological turn matching
    if (action.createdAt) {
      const actionTime = new Date(action.createdAt).getTime();
      const matchedTurn = turns.find(
        (t) => actionTime > t.startWindow && actionTime <= t.endWindow,
      );
      if (matchedTurn) {
        matchedTurn.confirmations.push(confirmation);
        continue;
      }
    }

    // 3. Fallback: collect for the last assistant turn
    unassigned.push(confirmation);
  }

  if (unassigned.length > 0) {
    turns[turns.length - 1].confirmations.push(...unassigned);
  }

  for (const turn of turns) {
    if (turn.confirmations.length > 0) {
      baseMessages[turn.messageIndex] = {
        ...baseMessages[turn.messageIndex],
        confirmations: turn.confirmations,
      };
    }
  }

  return baseMessages;
}

function toAgentConfirmation(action: AgentActionHistoryItem): AgentConfirmation {
  return {
    actionId: action.actionId,
    tool: action.tool,
    card: {
      type: (action.card?.type as "confirmation") ?? "confirmation",
      title: action.card?.title ?? action.tool,
      rows: action.card?.rows,
    },
    status: action.status,
  };
}
