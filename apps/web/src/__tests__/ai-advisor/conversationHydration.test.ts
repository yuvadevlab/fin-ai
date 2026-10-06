import { describe, it, expect } from "vitest";
import { hydrateConversationMessages } from "@/features/ai-advisor/api/conversationHydration";
import type { AiConversation } from "@/features/ai-advisor/api/useConversations";
import type { AgentActionHistoryItem } from "@/features/ai-advisor/api/agentActions";

describe("hydrateConversationMessages", () => {
  it("attaches actions to the specific turn where they occurred instead of dumping them at the bottom", () => {
    // 3 turns:
    // Turn 1: User asks for plan (10:00:00), Assistant gives plan (10:00:05)
    // Turn 2: User says apply fix (10:01:00), Actions proposed (10:01:03), Assistant proposes cards (10:01:06)
    // Turn 3: User asks follow-up (10:05:00), Assistant replies (10:05:05)
    const convo: AiConversation = {
      id: "convo-1",
      title: "Budget planning",
      userId: "user-1",
      createdAt: "2026-10-05T10:00:00.000Z",
      updatedAt: "2026-10-05T10:05:05.000Z",
      messages: [
        {
          id: "m-1",
          role: "USER",
          content: "Give me the plans based on my salary",
          createdAt: "2026-10-05T10:00:00.000Z",
        },
        {
          id: "m-2",
          role: "ASSISTANT",
          content: "Here is your 50/30/20 plan...",
          createdAt: "2026-10-05T10:00:05.000Z",
        },
        {
          id: "m-3",
          role: "USER",
          content: "apply the fix",
          createdAt: "2026-10-05T10:01:00.000Z",
        },
        {
          id: "m-4",
          role: "ASSISTANT",
          content: "I have prepared the budget actions for you to confirm.",
          createdAt: "2026-10-05T10:01:06.000Z",
        },
        {
          id: "m-5",
          role: "USER",
          content: "Now show my spending this month",
          createdAt: "2026-10-05T10:05:00.000Z",
        },
        {
          id: "m-6",
          role: "ASSISTANT",
          content: "Here is your current month spending breakdown.",
          createdAt: "2026-10-05T10:05:05.000Z",
        },
      ],
    };

    const actions: AgentActionHistoryItem[] = [
      {
        actionId: "act-1",
        tool: "budgets.create",
        card: { type: "confirmation", title: "Create budget: Loan EMI" },
        status: "executed",
        createdAt: "2026-10-05T10:01:03.000Z",
      },
      {
        actionId: "act-2",
        tool: "budgets.create",
        card: { type: "confirmation", title: "Create budget: Insurance" },
        status: "executed",
        createdAt: "2026-10-05T10:01:04.000Z",
      },
    ];

    const result = hydrateConversationMessages(convo, actions);

    expect(result).toHaveLength(6);
    // Turn 1 assistant message should have NO confirmations
    expect(result[1].confirmations).toBeUndefined();
    // Turn 2 assistant message should have the 2 confirmations
    expect(result[3].confirmations).toHaveLength(2);
    expect(result[3].confirmations?.[0].actionId).toBe("act-1");
    expect(result[3].confirmations?.[1].actionId).toBe("act-2");
    // Turn 3 assistant message (bottom) should NOT have confirmations
    expect(result[5].confirmations).toBeUndefined();
  });

  it("distributes actions across multiple turns correctly", () => {
    const convo: AiConversation = {
      id: "convo-2",
      title: "Multi-turn actions",
      userId: "user-1",
      createdAt: "2026-10-05T10:00:00.000Z",
      updatedAt: "2026-10-05T10:10:00.000Z",
      messages: [
        {
          id: "m-1",
          role: "USER",
          content: "Create groceries budget",
          createdAt: "2026-10-05T10:00:00.000Z",
        },
        {
          id: "m-2",
          role: "ASSISTANT",
          content: "Proposal created",
          createdAt: "2026-10-05T10:00:05.000Z",
        },
        {
          id: "m-3",
          role: "USER",
          content: "Update water budget",
          createdAt: "2026-10-05T10:05:00.000Z",
        },
        {
          id: "m-4",
          role: "ASSISTANT",
          content: "Update proposal created",
          createdAt: "2026-10-05T10:05:05.000Z",
        },
      ],
    };

    const actions: AgentActionHistoryItem[] = [
      {
        actionId: "act-create",
        tool: "budgets.create",
        card: { type: "confirmation", title: "Create Groceries" },
        status: "executed",
        createdAt: "2026-10-05T10:00:02.000Z",
      },
      {
        actionId: "act-update",
        tool: "budgets.update",
        card: { type: "confirmation", title: "Update Water" },
        status: "pending",
        createdAt: "2026-10-05T10:05:02.000Z",
      },
    ];

    const result = hydrateConversationMessages(convo, actions);

    expect(result[1].confirmations).toHaveLength(1);
    expect(result[1].confirmations?.[0].actionId).toBe("act-create");

    expect(result[3].confirmations).toHaveLength(1);
    expect(result[3].confirmations?.[0].actionId).toBe("act-update");
  });

  it("attaches to the single assistant message in a 1-turn conversation", () => {
    const convo: AiConversation = {
      id: "convo-single",
      title: "Single turn",
      userId: "user-1",
      createdAt: "2026-10-05T10:00:00.000Z",
      updatedAt: "2026-10-05T10:00:05.000Z",
      messages: [
        {
          id: "m-1",
          role: "USER",
          content: "Create budget",
          createdAt: "2026-10-05T10:00:00.000Z",
        },
        {
          id: "m-2",
          role: "ASSISTANT",
          content: "Budget proposed",
          createdAt: "2026-10-05T10:00:05.000Z",
        },
      ],
    };

    const actions: AgentActionHistoryItem[] = [
      {
        actionId: "act-1",
        tool: "budgets.create",
        card: { type: "confirmation", title: "Create budget" },
        status: "pending",
      },
    ];

    const result = hydrateConversationMessages(convo, actions);
    expect(result[1].confirmations).toHaveLength(1);
  });
});
