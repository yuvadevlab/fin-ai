import { describe, it, expect, vi } from "vitest";
import { TransactionType } from "@fin-ai/shared-types";
import { resolveTransactionRefs } from "./entity-reference";
import { executeActionConfirm } from "./action-execution.helper";
import { agentCreateTransactionSchema } from "./transactions.agent-schemas";
import { AgentActionStatus } from "@fin-ai/database";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { ToolRegistry } from "./tool-registry";
import type { AuditService } from "./audit.service";
import type { PrismaService } from "@/modules/prisma/prisma.service";
import { Logger } from "@yuva-devlab/logger";

describe("Agent Transfer & Action Confirmation Resolution", () => {
  describe("Transfer and Credit Card Category Resolution", () => {
    it("should resolve transfer category to Credit Card Bill when paying a credit card and category is omitted", async () => {
      const accounts = [
        { id: "acc-bank", name: "HDFC Bank", type: "BANK", isDefault: true },
        { id: "acc-cc", name: "HDFC Millennia Credit Card", type: "CREDIT_CARD" },
      ];
      const categories = [
        { id: "cat-1", name: "Groceries" },
        { id: "cat-cc", name: "Credit Card Bill" },
      ];
      const accService = {
        findAll: vi.fn().mockResolvedValue(accounts),
      } as unknown as AccountsService;
      const catService = {
        getCategories: vi.fn().mockResolvedValue(categories),
      } as unknown as CategoriesService;

      const result = await resolveTransactionRefs(accService, catService, "user-1", {
        type: TransactionType.TRANSFER,
        toAccount: "HDFC Millennia Credit Card",
      });

      expect(result.accountId).toBe("acc-bank");
      expect(result.toAccountId).toBe("acc-cc");
      expect(result.categoryId).toBe("cat-cc");
    });

    it("should allow omitting category in agentCreateTransactionSchema for transfers", () => {
      const parsed = agentCreateTransactionSchema.safeParse({
        amount: 4000,
        type: TransactionType.TRANSFER,
        toAccount: "HDFC Credit Card",
      });

      expect(parsed.success).toBe(true);
    });
  });

  describe("executeActionConfirm retry on FAILED status", () => {
    const mockTool = {
      name: "transactions.create",
      schema: { parse: vi.fn().mockImplementation((x: unknown) => x) },
      execute: vi.fn().mockResolvedValue({ id: "tx-1", amount: 100 }),
      serialize: vi.fn().mockReturnValue({ id: "tx-1" }),
      summarize: vi.fn().mockReturnValue("Transaction recorded"),
      invalidates: [],
    };

    const mockRegistry = {
      get: vi.fn().mockReturnValue(mockTool),
    } as unknown as ToolRegistry;

    const mockAudit = {
      record: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuditService;

    const logger = new Logger("TestLogger");

    it("should allow confirming a FAILED action when retried", async () => {
      const mockPrisma = {
        client: {
          agentAction: {
            findFirst: vi.fn().mockResolvedValue({
              id: "action-failed-1",
              userId: "user-1",
              status: AgentActionStatus.FAILED,
              tool: "transactions.create",
              input: { amount: 500 },
              expiresAt: new Date(Date.now() + 600000),
            }),
            update: vi.fn().mockResolvedValue({ id: "action-failed-1" }),
          },
        },
      } as unknown as PrismaService;

      const result = await executeActionConfirm(
        mockPrisma,
        mockRegistry,
        mockAudit,
        logger,
        "action-failed-1",
        "user-1",
      );

      expect(mockTool.execute).toHaveBeenCalled();
      expect(result).toHaveProperty("alreadyExecuted", false);
    });

    it("should reject action with REJECTED status", async () => {
      const mockPrisma = {
        client: {
          agentAction: {
            findFirst: vi.fn().mockResolvedValue({
              id: "action-rejected-1",
              userId: "user-1",
              status: "REJECTED",
              tool: "transactions.create",
              input: { amount: 500 },
              expiresAt: new Date(Date.now() + 600000),
            }),
          },
        },
      } as unknown as PrismaService;

      await expect(
        executeActionConfirm(
          mockPrisma,
          mockRegistry,
          mockAudit,
          logger,
          "action-rejected-1",
          "user-1",
        ),
      ).rejects.toThrow("Action is REJECTED");
    });
  });
});
