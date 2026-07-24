# FinAI Workspace Coding Standards & Agent Guidelines

This document defines the architectural conventions, component patterns, validation standards, state management practices, and styling guidelines for developing features in the **FinAI** monorepo.

---

## 1. Monorepo Package Boundaries & Responsibilities

- **`apps/web`**: Next.js 15 App Router frontend. Handles pages, feature-based components, layout routing, and UI interactions.
- **`apps/api`**: NestJS 10 REST API service. Handles authentication, database operations via Prisma, and Ollama LLM integration.
- **`packages/finance-engine`**: Pure mathematical functions for financial calculations (Health Score, Net Worth, Cash Flow, Savings Rate, Budget Usage, Portfolio Asset Allocation). **MUST contain zero side-effects and zero I/O**.
- **`packages/ui`**: Shared React components built with Radix UI, TailwindCSS, `<FormDialog>`, `<FormDialogField>`, `<PageHeader>`, and `<ConfirmDialog>`.
- **`packages/validation`**: Centralized Zod validation schemas for forms and API DTOs.
- **`packages/shared-types`**: TypeScript interfaces, DTO shapes, and enums shared across client and server.

---

## 2. Form & Dialog Implementation Standard

All data entry modals in `@finai/web` MUST follow the standardized **2-file feature pattern**:

```text
src/features/<feature-name>/components/
├── <Entity>Form.tsx         # Pure form fields presentation component
└── <Entity>Dialog.tsx       # Modal wrapper, Zod validation, and React Query mutation
```

### Pattern Rule 1: Form Component (`<Entity>Form.tsx`)

1. Add `"use client"` at the top of the file.
2. Accept `values`, `errors`, and `onChange` props typed via interface.
3. Define an array of `FormField` objects from `@finai/ui`.
4. Render fields using `<FormDialogField>`.

```tsx
"use client";

import { FormDialogField, FormField } from "@finai/ui";

export interface AccountFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function AccountForm({ values, errors, onChange }: AccountFormProps) {
  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: "Account Name",
      placeholder: "e.g. HDFC Salary Account",
    },
    {
      type: "select",
      name: "type",
      label: "Account Type",
      options: [
        { label: "Bank Account", value: "BANK" },
        { label: "Credit Card", value: "CREDIT_CARD" },
        { label: "Digital Wallet", value: "WALLET" },
      ],
    },
    {
      type: "number",
      name: "balance",
      label: "Initial Balance",
      placeholder: "0.00",
    },
  ];

  return (
    <>
      {fields.map((field) => (
        <FormDialogField
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          error={errors[field.name]}
          onChange={onChange}
        />
      ))}
    </>
  );
}
```

---

### Pattern Rule 2: Dialog Component (`<Entity>Dialog.tsx`)

1. Support both controlled (`open`, `onOpenChange`) and uncontrolled state via fallback (`useState`).
2. Retrieve workspace state via `useWorkspace()`.
3. Import the Zod validation schema from `@finai/validation`.
4. Validate input inside `handleSubmit` using `schema.safeParse()`.
5. Map validation issues to field error state:
   ```ts
   parseResult.error.issues.forEach((issue) => {
     const fieldName = issue.path[0] as string;
     fieldErrors[fieldName] = issue.message;
   });
   ```
6. Clear field errors on `onChange` event.
7. Wrap in `<FormDialog>` from `@finai/ui` and render root error alert when `errors.root` exists.

```tsx
"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { createAccountSchema } from "@finai/validation";
import { useCreateAccount } from "../api/createAccount";
import { useWorkspace } from "@/providers";
import { AccountForm } from "./AccountForm";

export interface AccountDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AccountDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AccountDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const { workspaceId } = useWorkspace();
  const createAccount = useCreateAccount(workspaceId);

  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    type: "BANK",
    balance: "0",
    currency: "INR",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parseResult = createAccountSchema.safeParse({
      name: values.name,
      type: values.type,
      balance: Number(values.balance || 0),
      currency: values.currency,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createAccount.mutateAsync(parseResult.data);
      setOpen?.(false);
      setValues({ name: "", type: "BANK", balance: "0", currency: "INR" });
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while linking the account.",
      });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Link Account"
      description="Link a new bank account or wallet to your workspace."
      submitLabel="Link Account"
      loading={createAccount.isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <div className="space-y-4">
        <AccountForm values={values} errors={errors} onChange={handleChange} />
      </div>
    </FormDialog>
  );
}
```

---

## 3. Zod Validation Standards (`packages/validation`)

1. ALL validation schemas MUST reside in `@finai/validation`. Never define inline schemas inside components or route handlers.
2. Always use `.safeParse()` instead of `.parse()` to avoid unhandled exceptions during form validation.
3. Export inferred TypeScript types for every schema:
   ```ts
   export type CreateAccountInput = z.infer<typeof createAccountSchema>;
   ```
4. Provide user-friendly, descriptive error messages for every field constraint (e.g. `.min(1, "Account name is required")`).

---

## 4. State Management & API Hooks

1. Place feature API hooks under `src/features/<feature-name>/api/` (e.g., `getAccounts.ts`, `createAccount.ts`, `deleteAccount.ts`).
2. Use `@tanstack/react-query` (`useQuery`, `useMutation`).
3. Automatically invalidate related query keys in `onSuccess` handlers:
   ```ts
   queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
   ```

---

## 5. UI & Styling Guidelines (`packages/ui`)

1. Use TailwindCSS classes exclusively. Do not write custom CSS rules unless adding animations to `globals.css`.
2. Use semantic color classes (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-destructive/15`, `text-destructive`).
3. Import icons exclusively from `lucide-react`.
4. Wrap pages in `<PageContainer>` and use `<PageHeader>` for standard title/action headers.
