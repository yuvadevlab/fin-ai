import { describe, it, expect } from "vitest";
import {
  agentCreateTransactionSchema,
  agentUpdateTransactionSchema,
} from "./transactions.agent-schemas";

describe("agentCreateTransactionSchema", () => {
  it("defaults type to EXPENSE when omitted by LLM tool calls", () => {
    const parsed = agentCreateTransactionSchema.parse({
      amount: 676.2,
      category: "Miscellaneous",
      notes: "Jailer 2 Movie",
      date: "2026-10-19",
    });

    expect(parsed.type).toBe("EXPENSE");
    expect(parsed.amount).toBe(676.2);
    expect(parsed.category).toBe("Miscellaneous");
    expect(parsed.notes).toBe("Jailer 2 Movie");
    expect(parsed.date).toBe("2026-10-19");
  });

  it("preserves explicit type when provided", () => {
    const parsed = agentCreateTransactionSchema.parse({
      amount: 50000,
      category: "Salary",
      type: "INCOME",
      date: "2026-10-01",
    });

    expect(parsed.type).toBe("INCOME");
  });

  it("does not force default type on agentUpdateTransactionSchema", () => {
    const parsed = agentUpdateTransactionSchema.parse({
      transactionId: "123e4567-e89b-12d3-a456-426614174000",
      amount: 150,
    });

    expect(parsed.type).toBeUndefined();
    expect(parsed.amount).toBe(150);
  });
});
