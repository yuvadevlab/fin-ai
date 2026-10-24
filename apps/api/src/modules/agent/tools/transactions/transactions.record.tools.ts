/**
 * @file apps/api/src/modules/agent/tools/transactions.record.tools.ts
 * @description Transaction "record" write tools (create + bulkCreate).
 * Decomposed into dedicated files to strictly follow the monorepo line limit rule.
 * @module @finai/api/agent/tools/transactions-record
 */

import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { TransactionsService } from "@/modules/transactions/transactions.service";
import { createTransactionCreateTool } from "./transactions.create.tool";
import { createTransactionBulkCreateTool } from "./transactions.bulk-create.tool";

export { createTransactionCreateTool, createTransactionBulkCreateTool };

/**
 * Transaction "record" write tools (create + bulkCreate).
 */
export function createTransactionRecordTools(
  transactionsService: TransactionsService,
  accountsService: AccountsService,
  categoriesService: CategoriesService,
) {
  return [
    createTransactionCreateTool(transactionsService, accountsService, categoriesService),
    createTransactionBulkCreateTool(transactionsService, accountsService, categoriesService),
  ];
}
