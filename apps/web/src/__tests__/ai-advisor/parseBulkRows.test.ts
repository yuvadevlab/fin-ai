import { describe, expect, it } from "vitest";
import { BULK_ITEM_PREFIX, ConfirmationRowLabel, TransactionType } from "@finai/shared-types";
import { parseBulkRows } from "../../features/ai-advisor/utils/parseBulkRows";

describe("parseBulkRows", () => {
  it("parses bulk sentinel rows into structured transaction items", () => {
    const rows: [string, string][] = [
      [ConfirmationRowLabel.BULK_COUNT, "3"],
      [ConfirmationRowLabel.BULK_TOTAL, "₹650.00"],
      [`${BULK_ITEM_PREFIX}0__`, "start"],
      [ConfirmationRowLabel.TYPE, TransactionType.EXPENSE],
      [ConfirmationRowLabel.AMOUNT, "₹100.00"],
      [ConfirmationRowLabel.DATE, "2026-09-14 (today)"],
      [ConfirmationRowLabel.ACCOUNT, "HDFC Savings"],
      [ConfirmationRowLabel.CATEGORY, "Food & Dining"],
      [ConfirmationRowLabel.NOTES, "Lunch with team"],
      [`${BULK_ITEM_PREFIX}1__`, "start"],
      [ConfirmationRowLabel.TYPE, TransactionType.EXPENSE],
      [ConfirmationRowLabel.AMOUNT, "₹50.00"],
      [ConfirmationRowLabel.DATE, "2026-09-14"],
      [ConfirmationRowLabel.ACCOUNT, "HDFC Savings"],
      [ConfirmationRowLabel.CATEGORY, "Personal Care & Grooming"],
      [`${BULK_ITEM_PREFIX}2__`, "start"],
      [ConfirmationRowLabel.TYPE, TransactionType.INCOME],
      [ConfirmationRowLabel.AMOUNT, "₹500.00"],
      [ConfirmationRowLabel.DATE, "2026-09-13 (yesterday)"],
      [ConfirmationRowLabel.ACCOUNT, "ICICI Bank"],
      [ConfirmationRowLabel.CATEGORY, "Freelance"],
    ];

    const result = parseBulkRows(rows);

    expect(result.count).toBe(3);
    expect(result.total).toBe("₹650.00");
    expect(result.items).toHaveLength(3);

    expect(result.items[0]).toEqual({
      index: 0,
      type: TransactionType.EXPENSE,
      amount: "₹100.00",
      date: "2026-09-14 (today)",
      account: "HDFC Savings",
      category: "Food & Dining",
      notes: "Lunch with team",
    });

    expect(result.items[1]?.category).toBe("Personal Care & Grooming");
    expect(result.items[2]?.type).toBe(TransactionType.INCOME);
  });

  it("handles empty rows gracefully", () => {
    const result = parseBulkRows([]);
    expect(result.count).toBe(0);
    expect(result.total).toBe("—");
    expect(result.items).toHaveLength(0);
  });
});
