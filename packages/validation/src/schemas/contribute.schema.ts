import { z } from "zod";

/**
 * Form-level schema: accepts the raw string input from the Contribute form
 * and transforms it into a positive number. Used by the web client only.
 */
export const contributeSchema = z.object({
  amount: z.string().transform((val) => {
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      throw new Error("Please enter a valid positive contribution amount.");
    }
    return num;
  }),
});

export type ContributeFormValues = z.infer<typeof contributeSchema>;

/**
 * API contract schema: the payload sent to `POST goals/:id/contribute`.
 * The web client sends the already-parsed numeric amount.
 */
export const contributeAmountSchema = z.object({
  amount: z.number().positive("Please enter a valid positive contribution amount."),
});

export type ContributeAmountInput = z.infer<typeof contributeAmountSchema>;
