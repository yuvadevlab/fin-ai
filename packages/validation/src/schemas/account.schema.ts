import { z } from "zod";

/**
 * Validation schema for creating a new financial account.
 *
 * Used by both the REST endpoint (`POST /accounts`) and the agent's
 * `accounts.create` tool. The balance defaults to 0 so a user can link an
 * account without knowing the exact current balance.
 */
export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["BANK", "CREDIT_CARD", "WALLET", "CASH"]),
  balance: z.number().default(0),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("INR"),
  isDefault: z.boolean().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

/**
 * Partial wrapper of {@link createAccountSchema} — every field optional.
 *
 * PATCH semantics: the service applies only the fields the caller supplies.
 */
export const updateAccountSchema = createAccountSchema.partial();

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
