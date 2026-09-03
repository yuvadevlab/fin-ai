import { describe, it, expect } from "vitest";
import { createAccountSchema } from "../schemas/account.schema";
import { clientTransactionSchema } from "../schemas/transaction.schema";

describe("Validation Schemas (Unit Tests)", () => {
  describe("createAccountSchema", () => {
    it("should validate a correct account object", () => {
      const validAccount = {
        name: "HDFC Savings",
        type: "BANK" as const,
        balance: 5000,
        currency: "INR",
      };
      const result = createAccountSchema.safeParse(validAccount);
      expect(result.success).toBe(true);
    });

    it("should fail if name is missing", () => {
      const invalidAccount = {
        type: "BANK",
        balance: 5000,
        currency: "INR",
      };
      const result = createAccountSchema.safeParse(invalidAccount);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Required");
      }
    });

    it("should fail if currency is not 3 letters", () => {
      const invalidAccount = {
        name: "HDFC Savings",
        type: "BANK",
        balance: 5000,
        currency: "INDIAN_RUPEES",
      };
      const result = createAccountSchema.safeParse(invalidAccount);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Currency must be a 3-letter code");
      }
    });
  });

  describe("clientTransactionSchema", () => {
    it("should validate a correct income transaction", () => {
      const validTx = {
        amount: "1000",
        kind: "income" as const,
        category: "Salary",
        account: "Salary Account",
        date: "2023-10-01",
      };
      const result = clientTransactionSchema.safeParse(validTx);
      expect(result.success).toBe(true);
    });

    it("should fail if amount is zero or negative", () => {
      const invalidTx = {
        amount: "0",
        kind: "expense" as const,
        category: "Food",
        account: "Wallet",
        date: "2023-10-01",
      };
      const result = clientTransactionSchema.safeParse(invalidTx);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Amount must be greater than zero");
      }
    });

    it("should fail if category is missing", () => {
      const invalidTx = {
        amount: "100",
        kind: "expense" as const,
        account: "Wallet",
        date: "2023-10-01",
      };
      const result = clientTransactionSchema.safeParse(invalidTx);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.find((i) => i.path[0] === "category")?.message).toBe("Required");
      }
    });

    it("should require toAccount for transfers", () => {
      const transferTx = {
        amount: "500",
        kind: "transfer" as const,
        category: "Internal",
        account: "Account A",
        date: "2023-10-01",
        // toAccount missing
      };
      const result = clientTransactionSchema.safeParse(transferTx);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.find((i) => i.path[0] === "toAccount")?.message).toBe(
          "Destination account is required for transfers",
        );
      }
    });
  });
});
