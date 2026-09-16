import { describe, expect, it } from "vitest";
import { parseBulkRows } from "../../features/ai-advisor/utils/parseBulkRows";

describe("parseBulkRows", () => {
  it("parses bulk sentinel rows into structured transaction items", () => {
    const rows: [string, string][] = [
      ["__bulk_count__", "3"],
      ["__bulk_total__", "₹650.00"],
      ["__item_0__", "start"],
      ["Type", "EXPENSE"],
      ["Amount", "₹100.00"],
      ["Date", "2026-09-14 (today)"],
      ["Account", "HDFC Savings"],
      ["Category", "Food & Dining"],
      ["Notes", "Lunch with team"],
      ["__item_1__", "start"],
      ["Type", "EXPENSE"],
      ["Amount", "₹50.00"],
      ["Date", "2026-09-14"],
      ["Account", "HDFC Savings"],
      ["Category", "Personal Care & Grooming"],
      ["__item_2__", "start"],
      ["Type", "INCOME"],
      ["Amount", "₹500.00"],
      ["Date", "2026-09-13 (yesterday)"],
      ["Account", "ICICI Bank"],
      ["Category", "Freelance"],
    ];

    const result = parseBulkRows(rows);

    expect(result.count).toBe(3);
    expect(result.total).toBe("₹650.00");
    expect(result.items).toHaveLength(3);

    expect(result.items[0]).toEqual({
      index: 0,
      type: "EXPENSE",
      amount: "₹100.00",
      date: "2026-09-14 (today)",
      account: "HDFC Savings",
      category: "Food & Dining",
      notes: "Lunch with team",
    });

    expect(result.items[1]?.category).toBe("Personal Care & Grooming");
    expect(result.items[2]?.type).toBe("INCOME");
  });

  it("handles empty rows gracefully", () => {
    const result = parseBulkRows([]);
    expect(result.count).toBe(0);
    expect(result.total).toBe("—");
    expect(result.items).toHaveLength(0);
  });
});
