import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
  categoryId: z.string().uuid("Invalid category ID"),
  amount: z.number().refine((v) => v !== 0, "Amount cannot be zero"),
  merchant: z.string().min(1, "Merchant is required").max(200),
  date: z.string().date("Invalid date format"),
  notes: z.string().max(500).optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial();

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionFilterSchema = z.object({
  workspace: z.string().optional(),
  category: z.string().optional(),
  account: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]).optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
