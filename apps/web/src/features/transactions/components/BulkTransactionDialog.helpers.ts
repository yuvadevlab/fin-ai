import { TransactionKind, TransactionType } from "@fin-ai/shared-types";
import { type CreateTransactionInput } from "@fin-ai/validation";
import { type BulkRow } from "./BulkTransactionForm";
import { UI_COPY } from "@/lib/ui-copy";
import { generateRowId } from "../utils/excelImport.helpers";

/**
 * Creates an empty default BulkRow instance.
 *
 * @param defaultAccount - Preselected default account ID.
 * @param defaultCategory - Preselected default category ID.
 * @param todayStr - Default transaction date formatted as YYYY-MM-DD.
 * @param id - Optional deterministic row identifier.
 * @returns Initialized BulkRow object.
 */
export const createEmptyRow = (
  defaultAccount: string,
  defaultCategory: string,
  todayStr: string,
  id?: string,
): BulkRow => ({
  id: id || generateRowId(),
  amount: "",
  kind: TransactionKind.EXPENSE,
  category: defaultCategory,
  account: defaultAccount,
  date: todayStr,
  notes: "",
});

/**
 * Validates a collection of bulk transaction rows and aggregates field-level errors.
 *
 * @param rows - Current array of BulkRows in the form.
 * @returns Dictionary of field-level errors keyed by `${rowId}_${field}` plus optional root error.
 */
export function validateBulkRows(rows: BulkRow[]): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const r of rows) {
    if (!r.amount || parseFloat(r.amount) <= 0) {
      errors[`${r.id}_amount`] = UI_COPY.TRANSACTIONS.IMPORT.VALIDATION_AMOUNT_REQUIRED;
    }
    if (!r.date) {
      errors[`${r.id}_date`] = UI_COPY.TRANSACTIONS.IMPORT.VALIDATION_DATE_REQUIRED;
    }
    if (!r.category) {
      errors[`${r.id}_category`] = UI_COPY.TRANSACTIONS.IMPORT.VALIDATION_CATEGORY_REQUIRED;
    }
    if (!r.account) {
      errors[`${r.id}_account`] = UI_COPY.TRANSACTIONS.IMPORT.VALIDATION_ACCOUNT_REQUIRED;
    }
    if (r.kind === TransactionKind.TRANSFER) {
      if (!r.toAccount) {
        errors[`${r.id}_toAccount`] = UI_COPY.TRANSACTIONS.IMPORT.VALIDATION_DESTINATION_REQUIRED;
      } else if (r.toAccount === r.account) {
        errors[`${r.id}_toAccount`] = UI_COPY.TRANSACTIONS.IMPORT.VALIDATION_DESTINATION_DIFFERENT;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    errors.root = UI_COPY.TRANSACTIONS.IMPORT.VALIDATION_FAILED;
  }

  return errors;
}

/**
 * Converts form BulkRows into API-compliant CreateTransactionInput array.
 *
 * @param rows - Validated BulkRow records.
 * @returns Array of payload objects ready for bulk API submission.
 */
export function mapRowsToBulkPayload(rows: BulkRow[]): CreateTransactionInput[] {
  const kindTypeMap: Record<TransactionKind, TransactionType> = {
    [TransactionKind.EXPENSE]: TransactionType.EXPENSE,
    [TransactionKind.INCOME]: TransactionType.INCOME,
    [TransactionKind.TRANSFER]: TransactionType.TRANSFER,
    [TransactionKind.INVESTMENT]: TransactionType.INVESTMENT,
    [TransactionKind.GOAL]: TransactionType.GOAL,
  };

  return rows.map((r) => ({
    amount: parseFloat(r.amount),
    type: kindTypeMap[r.kind] || TransactionType.EXPENSE,
    categoryId: r.category,
    accountId: r.account,
    toAccountId: r.toAccount || undefined,
    date: r.date,
    notes: r.notes || undefined,
  }));
}
