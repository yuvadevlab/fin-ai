import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["BANK", "CREDIT_CARD", "WALLET", "CASH"]),
  balance: z.number().default(0),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("INR"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema.partial();

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
