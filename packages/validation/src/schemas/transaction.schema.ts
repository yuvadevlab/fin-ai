import { z } from "zod";

/**
 * API contract for creating a transaction. All references are by UUID because
 * this schema is consumed by both the REST endpoint and the agent write tools
 * (after server-side name resolution). `toAccountId` is required only for
 * TRANSFER-type transactions — that conditional rule lives in the service
 * layer, not here.
 */
export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
  toAccountId: z.string().uuid("Invalid destination account ID").optional().nullable(),
  categoryId: z.string().uuid("Invalid category ID"),
  investmentId: z.string().uuid("Invalid investment ID").optional().nullable(),
  goalId: z.string().uuid("Invalid goal ID").optional().nullable(),
  amount: z.number().refine((v) => v !== 0, "Amount cannot be zero"),
  date: z.string().date("Invalid date format"),
  notes: z.string().max(500).optional().nullable(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT", "GOAL"]),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

/** Partial update: every field optional so callers can patch what they need. */
export const updateTransactionSchema = createTransactionSchema.partial();

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

/**
 * Query-parameter schema for the transaction list endpoint. Coerces the
 * pagination params from strings to numbers and applies sensible defaults
 * and limits so a malformed query can never request an unbounded result set.
 */
export const transactionFilterSchema = z.object({
  category: z.string().optional(),
  account: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT", "GOAL"]).optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

/**
 * Form-level schema for the web transaction form. Differs from the API schema:
 * references are by display name (not UUID), amount must be positive (not
 * non-zero), and cross-field refinements enforce that transfers carry a
 * destination account, investments carry an investment ID, and goals carry a goal ID.
 * Used by the web client only.
 */
export const clientTransactionSchema = z
  .object({
    amount: z.coerce.number().refine((v) => v > 0, "Amount must be greater than zero"),
    kind: z.enum(["expense", "income", "transfer", "investment", "goal"], {
      errorMap: () => ({ message: "Please select a valid type" }),
    }),
    category: z.string().min(1, "Category is required"),
    account: z.string().min(1, "Account is required"),
    toAccount: z.string().optional().nullable(),
    investmentId: z.string().optional().nullable(),
    goalId: z.string().optional().nullable(),
    date: z.string().min(1, "Date is required"),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .refine(
    (data) => {
      if (data.kind === "transfer" && !data.toAccount) {
        return false;
      }
      return true;
    },
    {
      message: "Destination account is required for transfers",
      path: ["toAccount"],
    },
  )
  .refine(
    (data) => {
      if (data.kind === "investment" && !data.investmentId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select an investment",
      path: ["investmentId"],
    },
  )
  .refine(
    (data) => {
      if (data.kind === "goal" && !data.goalId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a savings goal",
      path: ["goalId"],
    },
  );

export type ClientTransactionInput = z.infer<typeof clientTransactionSchema>;

/** Array of create-transaction inputs. The service enforces a max length. */
export const createBulkTransactionsSchema = z
  .array(createTransactionSchema)
  .min(1, "At least one transaction is required");

export type CreateBulkTransactionsInput = z.infer<typeof createBulkTransactionsSchema>;
