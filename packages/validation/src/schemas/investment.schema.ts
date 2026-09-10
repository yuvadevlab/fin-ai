import { z } from "zod";

/**
 * Schema for creating a new investment (stock, mutual fund, FD, etc.).
 * Tracks the current market value and the principal invested amount
 * so that unrealised profit/loss can be computed.
 */
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

/**
 * Partial update for investments — callers can patch name, assetClass,
 * currentValue, or investedAmount independently.
 */
export const updateInvestmentSchema = createInvestmentSchema.partial();

export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;

/**
 * API contract schema for `PATCH investments/:id/value`.
 * The endpoint only accepts the current market value.
 */
export const updateInvestmentValueSchema = z.object({
  currentValue: z.number().min(0, "Current value cannot be negative"),
});

export type UpdateInvestmentValueInput = z.infer<typeof updateInvestmentValueSchema>;
