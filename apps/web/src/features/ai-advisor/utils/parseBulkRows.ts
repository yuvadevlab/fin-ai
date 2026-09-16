export interface BulkTransactionItem {
  index: number;
  type: string;
  amount: string;
  date: string;
  account: string;
  category: string;
  toAccount?: string;
  notes?: string;
}

export interface ParsedBulkData {
  count: number;
  total: string;
  items: BulkTransactionItem[];
}

/**
 * Parses sentinel-delimited rows emitted by `transactions.bulkCreate.describe`.
 */
export function parseBulkRows(rows: [string, string][] = []): ParsedBulkData {
  let count = 0;
  let total = "";
  const items: BulkTransactionItem[] = [];
  let current: Partial<BulkTransactionItem> | null = null;

  for (const [key, value] of rows) {
    if (key === "__bulk_count__") {
      count = parseInt(value, 10) || 0;
    } else if (key === "__bulk_total__") {
      total = value;
    } else if (key.startsWith("__item_")) {
      if (current && current.index !== undefined) {
        items.push(current as BulkTransactionItem);
      }
      const idx = parseInt(key.replace("__item_", "").replace("__", ""), 10) || items.length;
      current = { index: idx, type: "EXPENSE", amount: "₹0", date: "", account: "", category: "" };
    } else if (current) {
      if (key === "Type") current.type = value;
      else if (key === "Amount") current.amount = value;
      else if (key === "Date") current.date = value;
      else if (key === "Account") current.account = value;
      else if (key === "Category") current.category = value;
      else if (key === "To account") current.toAccount = value;
      else if (key === "Notes") current.notes = value;
    }
  }

  if (current && current.index !== undefined) {
    items.push(current as BulkTransactionItem);
  }

  return {
    count: count || items.length,
    total: total || "—",
    items,
  };
}
