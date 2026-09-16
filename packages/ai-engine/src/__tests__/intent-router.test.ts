import { describe, expect, it } from "vitest";
import { requiresAgentTools, buildToolFreeAgentPrompt } from "../agent/intent-router";

describe("requiresAgentTools", () => {
  it("forces tool usage when there is a pending action awaiting confirmation", () => {
    expect(
      requiresAgentTools({
        question: "yes confirm",
        hasPendingAction: true,
      }),
    ).toBe(true);
  });

  it("forces tool usage when recent turns invoked tools", () => {
    expect(
      requiresAgentTools({
        question: "tell me more about that",
        hasRecentToolCalls: true,
      }),
    ).toBe(true);
  });

  it("identifies private financial data queries as requiring tools", () => {
    expect(requiresAgentTools({ question: "What are my accounts?" })).toBe(true);
    expect(requiresAgentTools({ question: "Show my transactions from last week" })).toBe(true);
    expect(requiresAgentTools({ question: "How much did I spend on dining?" })).toBe(true);
    expect(requiresAgentTools({ question: "What is my net worth?" })).toBe(true);
    expect(requiresAgentTools({ question: "List my budgets" })).toBe(true);
  });

  it("identifies mutation and action requests as requiring tools", () => {
    expect(requiresAgentTools({ question: "Add an expense of ₹500 for groceries" })).toBe(true);
    expect(requiresAgentTools({ question: "Spent 200 rs on coffee" })).toBe(true);
    expect(requiresAgentTools({ question: "Create a budget of 10000 for rent" })).toBe(true);
    expect(requiresAgentTools({ question: "Delete my old car savings goal" })).toBe(true);
    expect(requiresAgentTools({ question: "Transfer ₹1000 from checking to savings" })).toBe(true);
  });

  it("identifies terse log entries and money statements as requiring tools", () => {
    expect(requiresAgentTools({ question: "Today Doctor consultation (Maternity) 400" })).toBe(
      true,
    );
    expect(requiresAgentTools({ question: "spent 400 on lunch yesterday" })).toBe(true);
    expect(requiresAgentTools({ question: "Did I spend 400 on food yesterday?" })).toBe(true);
  });

  it("routes advice questions to agent loop so model has tools available", () => {
    expect(requiresAgentTools({ question: "Is it okay to spend 500 on a gift?" })).toBe(true);
    expect(requiresAgentTools({ question: "Can I afford ₹500 for a gift?" })).toBe(true);
  });

  it("routes conversational questions and greetings to agent loop", () => {
    expect(requiresAgentTools({ question: "Hello!" })).toBe(true);
    expect(requiresAgentTools({ question: "thanks!" })).toBe(true);
    expect(requiresAgentTools({ question: "Good morning, who are you?" })).toBe(true);
    expect(
      requiresAgentTools({ question: "What is an emergency fund and why do I need one?" }),
    ).toBe(true);
    expect(
      requiresAgentTools({ question: "Explain the difference between SIP and lump sum investing" }),
    ).toBe(true);
    expect(requiresAgentTools({ question: "How does compound interest work?" })).toBe(true);
    expect(requiresAgentTools({ question: "What is the 50/30/20 budgeting rule?" })).toBe(true);
  });

  it("fails open to agent mode when intent is unclear or terse", () => {
    // Terse receipt-style log entries (the original bug) — routed to agent even
    // with no verb/currency/noun match, because only clearly conversational
    // messages may take the tool-free fast path.
    expect(requiresAgentTools({ question: "Today Doctor consultation (Maternity) 400" })).toBe(
      true,
    );
    expect(requiresAgentTools({ question: "400 for petrol" })).toBe(true);
    expect(requiresAgentTools({ question: "auto fare 60 yesterday" })).toBe(true);
    expect(requiresAgentTools({ question: "I want to record a new expense." })).toBe(true);
    // Plain statements and new phrasings also default to the agent loop.
    expect(requiresAgentTools({ question: "I want to save more money" })).toBe(true);
    // Questions that reference financial entities stay in agent mode too.
    expect(requiresAgentTools({ question: "How many transactions did I make?" })).toBe(true);
  });
});

describe("buildToolFreeAgentPrompt", () => {
  it("builds a prompt without tool plan instructions or schema references", () => {
    const prompt = buildToolFreeAgentPrompt({
      currentDate: "2026-09-11",
      portfolioSnapshot: "Portfolio: ₹10,000",
    });

    expect(prompt).toContain("CONVERSATIONAL ADVISOR MODE");
    expect(prompt).toContain("2026-09-11");
    expect(prompt).toContain("Portfolio: ₹10,000");
    expect(prompt).not.toContain("<tool_plan>");
    expect(prompt).not.toContain("budgets.create");
  });
});
