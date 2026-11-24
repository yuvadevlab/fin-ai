import { describe, it, expect, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { resolveTransactionRefs } from "./entity-reference";
import { checkTransactionRefs, type TransactionRefInput } from "./transaction-ref-checker";
import { executeActionConfirm } from "./action-execution.helper";
import {
  resolveDefaultAccount,
  resolveDefaultAccountId,
} from "@/modules/accounts/accounts-preferences.util";
import { AgentActionStatus } from "@fin-ai/database";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { ToolRegistry } from "./tool-registry";
import type { AuditService } from "./audit.service";
import type { PrismaService } from "@/modules/prisma/prisma.service";
import { Logger } from "@yuva-devlab/logger";

describe("Agent Account Resolution & Action Confirmation", () => {
  const mockAccounts = [
    { id: "acc-1", name: "HDFC Bank", isDefault: false },
    { id: "acc-2", name: "ICICI Bank", isDefault: false },
  ];

  const mockCategories = [
    { id: "cat-1", name: "Groceries", isDefault: true },
    { id: "cat-2", name: "Bike Service & Maintenance", isDefault: false },
  ];

  const mockAccountsService = {
    findAll: vi.fn().mockResolvedValue(mockAccounts),
  } as unknown as AccountsService;

  const mockCategoriesService = {
    getCategories: vi.fn().mockResolvedValue(mockCategories),
  } as unknown as CategoriesService;

  describe("resolveTransactionRefs", () => {
    it("should fall back to accounts[0] when neither account nor default account is set", async () => {
      const result = await resolveTransactionRefs(
        mockAccountsService,
        mockCategoriesService,
        "user-1",
        { category: "Bike Service & Maintenance" } as TransactionRefInput,
      );

      expect(result.accountId).toBe("acc-1");
      expect(result.categoryId).toBe("cat-2");
    });

    it("should prefer 1st BANK account over non-bank accounts when neither account nor default is set", async () => {
      const accountsWithNonBankFirst = [
        { id: "acc-wallet", name: "Paytm Wallet", type: "WALLET", isDefault: false },
        { id: "acc-bank", name: "HDFC Bank", type: "BANK", isDefault: false },
        { id: "acc-credit", name: "Credit Card", type: "CREDIT_CARD", isDefault: false },
      ];
      const customAccountsService = {
        findAll: vi.fn().mockResolvedValue(accountsWithNonBankFirst),
      } as unknown as AccountsService;

      const result = await resolveTransactionRefs(
        customAccountsService,
        mockCategoriesService,
        "user-1",
        { category: "Groceries" } as TransactionRefInput,
      );

      expect(result.accountId).toBe("acc-bank");
    });

    it("should fall back to accounts[0] when no account has type BANK and no default is set", async () => {
      const accountsNoBank = [
        { id: "acc-wallet", name: "Paytm Wallet", type: "WALLET", isDefault: false },
        { id: "acc-cash", name: "Cash", type: "CASH", isDefault: false },
      ];
      const customAccountsService = {
        findAll: vi.fn().mockResolvedValue(accountsNoBank),
      } as unknown as AccountsService;

      const result = await resolveTransactionRefs(
        customAccountsService,
        mockCategoriesService,
        "user-1",
        { category: "Groceries" } as TransactionRefInput,
      );

      expect(result.accountId).toBe("acc-wallet");
    });

    it("should prefer explicit isDefault account when present", async () => {
      const accountsWithDefault = [
        { id: "acc-1", name: "HDFC Bank", isDefault: false },
        { id: "acc-2", name: "ICICI Bank", isDefault: true },
      ];
      const customAccountsService = {
        findAll: vi.fn().mockResolvedValue(accountsWithDefault),
      } as unknown as AccountsService;

      const result = await resolveTransactionRefs(
        customAccountsService,
        mockCategoriesService,
        "user-1",
        { category: "Groceries" } as TransactionRefInput,
      );

      expect(result.accountId).toBe("acc-2");
      expect(result.categoryId).toBe("cat-1");
    });

    it("should resolve explicit account name over default", async () => {
      const result = await resolveTransactionRefs(
        mockAccountsService,
        mockCategoriesService,
        "user-1",
        { category: "Groceries", account: "ICICI" } as TransactionRefInput,
      );

      expect(result.accountId).toBe("acc-2");
    });

    it("should throw BadRequestException when user has no active accounts", async () => {
      const emptyAccountsService = {
        findAll: vi.fn().mockResolvedValue([]),
      } as unknown as AccountsService;

      await expect(
        resolveTransactionRefs(emptyAccountsService, mockCategoriesService, "user-1", {
          category: "Groceries",
        } as TransactionRefInput),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("checkTransactionRefs", () => {
    it("should produce no account warnings when accounts exist even without explicit account", async () => {
      const check = await checkTransactionRefs(
        mockAccountsService,
        mockCategoriesService,
        "user-1",
        { category: "Groceries" } as TransactionRefInput,
      );

      const accountWarnings = check.warnings.filter((w) => w.field === "Account");
      expect(accountWarnings).toHaveLength(0);
    });

    it("should warn when user has 0 accounts and no account is specified", async () => {
      const emptyAccountsService = {
        findAll: vi.fn().mockResolvedValue([]),
      } as unknown as AccountsService;

      const check = await checkTransactionRefs(
        emptyAccountsService,
        mockCategoriesService,
        "user-1",
        { category: "Groceries" } as TransactionRefInput,
      );

      const accountWarnings = check.warnings.filter((w) => w.field === "Account");
      expect(accountWarnings.length).toBeGreaterThan(0);
      expect(accountWarnings[0].message).toContain(
        "No account specified and no active accounts exist",
      );
    });
  });

  describe("executeActionConfirm retry on FAILED status", () => {
    const logger = new Logger("TestLogger");
    const mockAudit = { record: vi.fn().mockResolvedValue(undefined) } as unknown as AuditService;
    const mockTool = {
      schema: { parse: vi.fn().mockImplementation((x: unknown) => x) },
      execute: vi.fn().mockResolvedValue({ id: "tx-123", amount: 3700 }),
      serialize: vi.fn().mockReturnValue({ id: "tx-123" }),
      summarize: vi.fn().mockReturnValue("Transaction recorded"),
    };
    const mockRegistry = {
      get: vi.fn().mockReturnValue(mockTool),
    } as unknown as ToolRegistry;

    it("should allow confirming a FAILED action when retried", async () => {
      const mockPrisma = {
        client: {
          agentAction: {
            findFirst: vi.fn().mockResolvedValue({
              id: "action-failed-1",
              userId: "user-1",
              status: AgentActionStatus.FAILED,
              tool: "transactions.create",
              input: { amount: 3700 },
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
      expect(result).toHaveProperty("result");
      expect(mockPrisma.client.agentAction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: AgentActionStatus.EXECUTED }),
        }),
      );
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
              input: { amount: 3700 },
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

  describe("resolveDefaultAccount & resolveDefaultAccountId", () => {
    it("should return explicit preference when it matches an existing account", () => {
      const accounts = [
        { id: "acc-1", name: "Wallet", type: "WALLET" },
        { id: "acc-2", name: "HDFC", type: "BANK" },
      ];
      expect(resolveDefaultAccount(accounts, "acc-1")?.id).toBe("acc-1");
      expect(resolveDefaultAccountId(accounts, "acc-1")).toBe("acc-1");
    });

    it("should prefer 1st BANK account when no preference is set", () => {
      const accounts = [
        { id: "acc-wallet", name: "Wallet", type: "WALLET" },
        { id: "acc-bank-1", name: "HDFC", type: "BANK" },
        { id: "acc-bank-2", name: "SBI", type: "BANK" },
      ];
      expect(resolveDefaultAccount(accounts)?.id).toBe("acc-bank-1");
      expect(resolveDefaultAccountId(accounts)).toBe("acc-bank-1");
    });

    it("should fall back to accounts[0] when no BANK account exists", () => {
      const accounts = [
        { id: "acc-wallet", name: "Wallet", type: "WALLET" },
        { id: "acc-card", name: "Credit Card", type: "CREDIT_CARD" },
      ];
      expect(resolveDefaultAccount(accounts)?.id).toBe("acc-wallet");
      expect(resolveDefaultAccountId(accounts)).toBe("acc-wallet");
    });

    it("should return undefined and null for empty accounts list", () => {
      expect(resolveDefaultAccount([])).toBeUndefined();
      expect(resolveDefaultAccountId([])).toBeNull();
    });
  });
});
