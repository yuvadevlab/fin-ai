import { describe, it, expect } from "vitest";
import { TransactionKind } from "@fin-ai/shared-types";
import {
  parseExcelDate,
  resolveColumnIndices,
  matchEntityOption,
  parseTransactionKind,
  type SelectOption,
} from "@/features/transactions/utils/excelImport.helpers";
import { validateBulkRows } from "@/features/transactions/components/BulkTransactionDialog.helpers";
import { type BulkRow } from "@/features/transactions/components/BulkTransactionForm";

describe("excelImport.helpers", () => {
  describe("parseExcelDate", () => {
    it("parses numeric Excel serial dates correctly", () => {
      // 45620 is 2024-11-24
      const result = parseExcelDate(45620);
      expect(result).toBe("2024-11-24");
    });

    it("parses native Date objects using UTC to prevent timezone shift", () => {
      // Midnight UTC Date
      const date = new Date("2024-11-25T00:00:00.000Z");
      const result = parseExcelDate(date);
      expect(result).toBe("2024-11-25");
    });

    it("parses DD/MM/YYYY, DD-MM-YYYY, and DD.MM.YYYY string formats", () => {
      expect(parseExcelDate("25/11/2024")).toBe("2024-11-25");
      expect(parseExcelDate("25-11-2024")).toBe("2024-11-25");
      expect(parseExcelDate("25.11.2024")).toBe("2024-11-25");
      expect(parseExcelDate("05/01/2025")).toBe("2025-01-05");
    });

    it("parses YYYY-MM-DD string formats", () => {
      expect(parseExcelDate("2024-11-25")).toBe("2024-11-25");
      expect(parseExcelDate("2025/03/15")).toBe("2025-03-15");
    });

    it("falls back to today's date on null, undefined, or empty values", () => {
      const fallback = "2026-11-25";
      expect(parseExcelDate(null, fallback)).toBe(fallback);
      expect(parseExcelDate(undefined, fallback)).toBe(fallback);
      expect(parseExcelDate("", fallback)).toBe(fallback);
    });
  });

  describe("resolveColumnIndices", () => {
    it("correctly identifies template headers and separates account from toAccount", () => {
      const headers = [
        "Date (DD/MM/YYYY)",
        "Type",
        "Amount (INR)",
        "Category",
        "Account",
        "To Account (Optional)",
        "Notes / Description",
      ];
      const indices = resolveColumnIndices(headers);
      expect(indices.dateIdx).toBe(0);
      expect(indices.typeIdx).toBe(1);
      expect(indices.amountIdx).toBe(2);
      expect(indices.categoryIdx).toBe(3);
      expect(indices.accountIdx).toBe(4);
      expect(indices.toAccountIdx).toBe(5);
      expect(indices.notesIdx).toBe(6);
    });

    it("handles alternate keyword ordering without collision", () => {
      const headers = [
        "Summary",
        "Destination Account",
        "Source Account",
        "Kind",
        "Price",
        "Cat",
        "Date",
      ];
      const indices = resolveColumnIndices(headers);
      expect(indices.notesIdx).toBe(0);
      expect(indices.toAccountIdx).toBe(1);
      expect(indices.accountIdx).toBe(2);
      expect(indices.typeIdx).toBe(3);
      expect(indices.amountIdx).toBe(4);
      expect(indices.categoryIdx).toBe(5);
      expect(indices.dateIdx).toBe(6);
    });
  });

  describe("matchEntityOption", () => {
    const mockAccounts: SelectOption[] = [
      { label: "HDFC Salary (BANK)", value: "acc-hdfc-1" },
      { label: "ICICI Savings (BANK)", value: "acc-icici-2" },
      { label: "Amazon Pay (WALLET)", value: "acc-amzn-3" },
      { label: "Axis Bank Credit Card (CREDIT_CARD)", value: "acc-axis-4" },
    ];

    it("matches exact bare label stripped of parenthesized suffix", () => {
      const match = matchEntityOption("HDFC Salary", mockAccounts);
      expect(match?.value).toBe("acc-hdfc-1");
    });

    it("matches case-insensitively", () => {
      const match = matchEntityOption("hdfc salary", mockAccounts);
      expect(match?.value).toBe("acc-hdfc-1");
    });

    it("matches exact value ID", () => {
      const match = matchEntityOption("acc-amzn-3", mockAccounts);
      expect(match?.label).toBe("Amazon Pay (WALLET)");
    });

    it("matches prefix starts-with", () => {
      const match = matchEntityOption("ICICI", mockAccounts);
      expect(match?.value).toBe("acc-icici-2");
    });

    it("returns undefined for unrecognized entities rather than wrong default", () => {
      const match = matchEntityOption("Citibank Platinum", mockAccounts);
      expect(match).toBeUndefined();
    });

    it("does not match 'BANK' against all accounts having (BANK) suffix", () => {
      const match = matchEntityOption("Bank", mockAccounts);
      // 'Bank' should match 'Axis Bank Credit Card' via bareLabel substring, not HDFC Salary
      expect(match?.value).toBe("acc-axis-4");
    });
  });

  describe("parseTransactionKind", () => {
    it("maps strings correctly to TransactionKind", () => {
      expect(parseTransactionKind("Expense")).toBe(TransactionKind.EXPENSE);
      expect(parseTransactionKind("Income")).toBe(TransactionKind.INCOME);
      expect(parseTransactionKind("Credit")).toBe(TransactionKind.INCOME);
      expect(parseTransactionKind("Transfer")).toBe(TransactionKind.TRANSFER);
      expect(parseTransactionKind("Investment")).toBe(TransactionKind.INVESTMENT);
      expect(parseTransactionKind("Goal")).toBe(TransactionKind.GOAL);
      expect(parseTransactionKind("unknown")).toBe(TransactionKind.EXPENSE);
    });
  });

  describe("validateBulkRows", () => {
    it("flags missing amount, date, category, and account", () => {
      const rows: BulkRow[] = [
        {
          id: "row_1",
          amount: "",
          kind: TransactionKind.EXPENSE,
          category: "",
          account: "",
          date: "",
          notes: "",
        },
      ];
      const errors = validateBulkRows(rows);
      expect(errors["row_1_amount"]).toBeDefined();
      expect(errors["row_1_date"]).toBeDefined();
      expect(errors["row_1_category"]).toBeDefined();
      expect(errors["row_1_account"]).toBeDefined();
      expect(errors.root).toBeDefined();
    });

    it("flags transfer when toAccount is missing or identical to account", () => {
      const rows: BulkRow[] = [
        {
          id: "row_2",
          amount: "500",
          kind: TransactionKind.TRANSFER,
          category: "cat-transfer",
          account: "acc-1",
          toAccount: "acc-1",
          date: "2024-11-25",
          notes: "",
        },
      ];
      const errors = validateBulkRows(rows);
      expect(errors["row_2_toAccount"]).toBeDefined();
    });

    it("returns empty error object for valid rows", () => {
      const rows: BulkRow[] = [
        {
          id: "row_3",
          amount: "1500",
          kind: TransactionKind.EXPENSE,
          category: "cat-food",
          account: "acc-1",
          date: "2024-11-25",
          notes: "Dinner",
        },
      ];
      const errors = validateBulkRows(rows);
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});
