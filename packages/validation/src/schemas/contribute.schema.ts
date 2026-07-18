import { z } from "zod";

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
