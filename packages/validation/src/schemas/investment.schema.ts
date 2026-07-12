import { z } from "zod";

export const createInvestmentSchema = z.object({
  name: z.string().min(1, "Investment name is required").max(200),
  assetClass: z.enum([
    "MUTUAL_FUND",
    "STOCK",
    "FIXED_DEPOSIT",
    "GOLD",
    "EPF",
    "PPF",
    "REAL_ESTATE",
    "CRYPTO",
    "OTHER",
  ]),
  currentValue: z.number().min(0),
  investedAmount: z.number().min(0),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;

export const updateInvestmentSchema = createInvestmentSchema.partial();

export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
