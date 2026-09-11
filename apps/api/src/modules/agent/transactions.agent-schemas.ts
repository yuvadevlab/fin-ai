import { z } from "zod";
import { createTransactionSchema } from "@finai/validation";
import { serverTodayISO } from "./date.utils";
import { parseAgentDateExpression } from "./date-expression";

/**
 * Agent-facing transaction write schemas.
 *
 * Unlike the REST `createTransactionSchema` (which requires raw UUIDs), these
 * accept an account/category by NAME or by ID. The tool executor resolves
 * names to real, ownership-checked IDs at execute time, so a hallucinated
 * UUID can never reach the database.
 *
 * Date handling:
 * - `date` is OPTIONAL: if the user didn't name a date, the server uses today.
 * - `dateExpression` carries the user's ORIGINAL wording ("yesterday", "2 days
 *   ago", "aug 15", "tomorrow") so the server can resolve it deterministically
 *   instead of relying on the LLM's calendar math.
 * - A bare (expression-less) future date is rejected — it's almost always an
 *   LLM hallucination. A future date derived from a user-named expression is
 *   allowed, because the confirmation card shows it before the user confirms.
 */

export const agentTransactionRefFields = {
  account: z.string().min(1, "Account name is required").max(100).optional(),
  accountId: z.string().uuid("Invalid account ID").optional(),
  category: z.string().min(1, "Category name is required").max(100).optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  toAccount: z.string().min(1, "Destination account name is required").max(100).optional(),
  toAccountId: z.string().uuid("Invalid destination account ID").optional().nullable(),
  date: z.string().date("Invalid date format").optional(),
  dateExpression: z.string().min(1, "Date phrase is required").max(80).optional(),
};

const agentTransactionBase = createTransactionSchema
  .omit({ accountId: true, toAccountId: true, categoryId: true, date: true })
  .extend(agentTransactionRefFields);

const DATE_ERROR_MESSAGE =
  "The date is invalid. When the user mentions a date ('yesterday', '2 days ago', 'aug 15', 'tomorrow'), also pass it verbatim in dateExpression. A future date without a user-named date phrase is rejected.";

/**
 * Validate the date across both schemas:
 * - an unparseable dateExpression fails;
 * - a future bare date (no expression) fails;
 * - past/today dates pass; expression-backed dates are resolved at execute time.
 */
function validDateInput(input: { date?: string | null; dateExpression?: string | null }): boolean {
  if (input.dateExpression) {
    return parseAgentDateExpression(input.dateExpression, serverTodayISO()) !== null;
  }
  if (input.date) {
    return input.date <= serverTodayISO();
  }
  return true;
}

const dateError = { message: DATE_ERROR_MESSAGE, path: ["date"] };

const categoryError = { message: "Provide a category name or categoryId", path: ["category"] };
const transferError = {
  message: "Destination account is required for transfers",
  path: ["toAccount"],
};

export const agentCreateTransactionSchema = agentTransactionBase
  .refine(validDateInput, dateError)
  .refine((v) => v.category !== undefined || v.categoryId !== undefined, categoryError)
  .refine(
    (v) => v.type !== "TRANSFER" || v.toAccount !== undefined || v.toAccountId !== undefined,
    transferError,
  );

export type AgentCreateTransactionInput = z.infer<typeof agentCreateTransactionSchema>;

export const agentUpdateTransactionSchema = agentTransactionBase
  .partial()
  .extend({ transactionId: z.string().uuid("Invalid transaction ID") })
  .required({ transactionId: true })
  .refine(validDateInput, dateError);

export type AgentUpdateTransactionInput = z.infer<typeof agentUpdateTransactionSchema>;
