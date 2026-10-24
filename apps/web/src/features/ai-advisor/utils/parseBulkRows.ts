import { BULK_ITEM_PREFIX, ConfirmationRowLabel, TransactionType } from "@finai/shared-types";

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
    if (key === ConfirmationRowLabel.BULK_COUNT) {
      count = parseInt(value, 10) || 0;
    } else if (key === ConfirmationRowLabel.BULK_TOTAL) {
      total = value;
    } else if (key.startsWith(BULK_ITEM_PREFIX)) {
      if (current && current.index !== undefined) {
        items.push(current as BulkTransactionItem);
      }
      const idx = parseInt(key.replace(BULK_ITEM_PREFIX, "").replace("__", ""), 10) || items.length;
      current = {
        index: idx,
        type: TransactionType.EXPENSE,
        amount: "₹0",
        date: "",
        account: "",
        category: "",
      };
    } else if (current) {
      if (key === ConfirmationRowLabel.TYPE) current.type = value;
      else if (key === ConfirmationRowLabel.AMOUNT) current.amount = value;
      else if (key === ConfirmationRowLabel.DATE) current.date = value;
      else if (key === ConfirmationRowLabel.ACCOUNT) current.account = value;
      else if (key === ConfirmationRowLabel.CATEGORY) current.category = value;
      else if (key === ConfirmationRowLabel.TO_ACCOUNT) current.toAccount = value;
      else if (key === ConfirmationRowLabel.NOTES) current.notes = value;
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
