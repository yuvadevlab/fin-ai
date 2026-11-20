import { BULK_ITEM_PREFIX, ConfirmationRowLabel, TransactionType } from "@fin-ai/shared-types";

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
 * Parses sentinel-delimited rows emitted by `transactions.bulkCreate.describe`
 * or single transaction rows emitted by `transactions.create.describe`.
 */
export function parseBulkRows(rows: [string, string][] = []): ParsedBulkData {
  let count = 0;
  let total = "";
  const items: BulkTransactionItem[] = [];
  let current: Partial<BulkTransactionItem> | null = null;

  const isBulkFormat = rows.some(
    ([key]) => key === ConfirmationRowLabel.BULK_COUNT || key.startsWith(BULK_ITEM_PREFIX),
  );

  // Transparently adapt single transaction rows (count === 1) to BulkTransactionItem
  if (!isBulkFormat && rows.length > 0) {
    let type: string = TransactionType.EXPENSE;
    let amount = "₹0";
    let date = "";
    let account = "";
    let category = "";
    let toAccount: string | undefined;
    let notes: string | undefined;

    for (const [key, value] of rows) {
      const lower = key.toLowerCase();
      if (lower === ConfirmationRowLabel.TYPE.toLowerCase()) type = value;
      else if (lower === ConfirmationRowLabel.AMOUNT.toLowerCase()) amount = value;
      else if (lower === ConfirmationRowLabel.DATE.toLowerCase()) date = value;
      else if (lower === ConfirmationRowLabel.ACCOUNT.toLowerCase()) account = value;
      else if (lower === ConfirmationRowLabel.CATEGORY.toLowerCase()) category = value;
      else if (lower === ConfirmationRowLabel.TO_ACCOUNT.toLowerCase()) toAccount = value;
      else if (lower === ConfirmationRowLabel.NOTES.toLowerCase()) notes = value;
    }

    return {
      count: 1,
      total: amount,
      items: [
        {
          index: 0,
          type,
          amount,
          date,
          account,
          category,
          toAccount,
          notes,
        },
      ],
    };
  }

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
