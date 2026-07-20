# @finai/validation

`@finai/validation` contains all Zod data validation schemas used for client-side form validation and server-side request DTO verification in FinAI.

---

## Shared Validation Schemas

### 1. Account Creation Schema (`createAccountSchema`)

```ts
import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50),
  type: z.enum(["BANK", "CREDIT_CARD", "WALLET", "CASH"]),
  balance: z.number().min(0, "Balance must be non-negative"),
  currency: z.string().length(3, "Currency code must be 3 characters").default("INR"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
```

### 2. Transaction Creation Schema (`createTransactionSchema`)

```ts
export const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});
```

---

## Safe Parsing & Error Mapping in Forms

```ts
import { createAccountSchema } from "@finai/validation";

const parseResult = createAccountSchema.safeParse(formData);

if (!parseResult.success) {
  const errors: Record<string, string> = {};
  parseResult.error.issues.forEach((issue) => {
    const fieldName = issue.path[0] as string;
    errors[fieldName] = issue.message;
  });
  setErrors(errors);
}
```

---

## Build Commands

```bash
# Compile TS declarations and distribution files
pnpm --filter @finai/validation build
```
