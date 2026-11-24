import { describe, it, expect, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { resolveTransactionRefs } from "./entity-reference";
import { checkTransactionRefs, type TransactionRefInput } from "./transaction-ref-checker";
import {
  resolveDefaultAccount,
  resolveDefaultAccountId,
} from "@/modules/accounts/accounts-preferences.util";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";

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
