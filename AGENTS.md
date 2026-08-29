# FinAI Monorepo — Comprehensive AI Agent Guidelines & Architecture Rules

> **FOR ALL AI CODING ASSISTANTS & AGENTS (Antigravity [Primary], Visual Studio Copilot/Agent [Secondary], Claude Code [Occasional]):**
> Read and follow this file strictly. It defines the architectural conventions, component patterns, validation standards, state management practices, styling guidelines, and AI safety guardrails for developing features in the **FinAI** monorepo.

---

## 1. Monorepo Package Boundaries & Responsibilities

When writing or modifying code in FinAI, strictly respect package responsibilities. Never leak side-effects across package boundaries:

```text
finai/
├── apps/
│   ├── web/                     # Next.js 15 App Router Frontend
│   └── api/                     # NestJS 10 REST API Backend & Ollama AI Engine
└── packages/
    ├── ai-engine/               # Shared LLM Prompts, Safety Guardrails, System Personas & Prompt Builders
    ├── finance-engine/          # Pure mathematical calculation engine (zero side-effects, zero I/O)
    ├── shared-types/            # Shared TypeScript DTOs, interfaces, constants, and enums
    ├── validation/              # Centralized Zod validation schemas
    ├── ui/                      # Shared design system components & Radix UI primitives
    ├── database/                # Prisma ORM schema & PostgreSQL client
    └── logger/                  # Universal structured Winston logger
```

### Strict Package Placement Rules

- **Shared Constants & Types (`@finai/shared-types`)**: ANY constants, DTO shapes, Enums (`AccountType`, `TransactionType`, `GoalType`), or TypeScript interfaces shared across `apps/web`, `apps/api`, or other `packages/` MUST reside in `@finai/shared-types`. **NEVER duplicate types or constants across apps or packages**.
- **Financial Logic & Formulas (`@finai/finance-engine`)**: ALL financial calculation logic (Health Score, Net Worth, Cash Flow, Savings Rate, Budget Usage, Portfolio Asset Allocation, Goal Projections) MUST reside in `@finai/finance-engine`. **MUST contain zero side-effects, zero I/O, zero database access, and zero HTTP calls**.
- **AI Prompts, Persona & Safety Guardrails (`@finai/ai-engine`)**: ALL system personas, prompt templates (`ADVISOR_SYSTEM_PROMPT_TEMPLATE`), prompt builder factory functions, follow-up parsers (`extractFollowUpQuestions`), and domain scope rejection rules MUST reside in `@finai/ai-engine`.
- **`@finai/web`**: Next.js 15 App Router frontend. Organised strictly into feature directories under `src/features/<feature-name>/`:
  - `components/`: Feature React components
  - `api/`: React Query API hooks (`getAccounts.ts`, `createAccount.ts`, `deleteAccount.ts`)
  - `hooks/`: Feature-specific custom hooks
  - `utils/`: Feature-specific helper utilities
- **`@finai/api`**: NestJS 10 REST API backend. Organized into NestJS modules under `src/modules/<module-name>/`:
  - Controllers with OpenAPI `@ApiOperation()` decorators.
  - Services for Prisma ORM queries.
  - Guards (`JwtAuthGuard`) and decorators (`@CurrentUser()`).
- **`@finai/ui`**: Shared React components built with Radix UI, TailwindCSS, `<FormDialog>`, `<FormDialogField>`, `<PageHeader>`, and `<ConfirmDialog>`.
- **`@finai/validation`**: Centralized Zod validation schemas for forms and API DTOs.

---

## 2. Standard 2-File Feature Modal Pattern

All data entry modals in `@finai/web` MUST follow the standardized **2-file feature pattern**:

```text
src/features/<feature-name>/components/
├── <Entity>Form.tsx         # Pure form fields presentation component
└── <Entity>Dialog.tsx       # Modal wrapper, Zod validation, and React Query mutation
```

### Rule 1: Form Component (`<Entity>Form.tsx`)

1. Add `"use client"` at the top of the file.
2. Accept `values`, `errors`, and `onChange` props typed via interface.
3. Define an array of `FormField` objects from `@finai/ui`.
4. Render fields using `<FormDialogField />`.

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

### Rule 2: Dialog Component (`<Entity>Dialog.tsx`)

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

1. **Single Source of Truth**: ALL validation schemas MUST reside in `@finai/validation`. Never define inline Zod schemas inside frontend components or backend route handlers.
2. **Safe Parsing**: Always use `.safeParse()` instead of `.parse()` to avoid unhandled runtime exceptions.
3. **Type Exports**: Always export inferred TypeScript types for every schema:
   ```ts
   export type CreateAccountInput = z.infer<typeof createAccountSchema>;
   ```
4. **User-Friendly Error Messages**: Provide explicit, descriptive error messages for every field constraint (e.g. `.min(1, "Account name is required")`).

---

## 4. State Management & API Hooks

1. **Location**: Place feature API hooks under `src/features/<feature-name>/api/` (e.g., `getAccounts.ts`, `createAccount.ts`, `deleteAccount.ts`).
2. **React Query**: Use `@tanstack/react-query` (`useQuery`, `useMutation`).
3. **Automatic Cache Invalidation**: Automatically invalidate related query keys in `onSuccess` mutation handlers:
   ```ts
   queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
   ```

---

## 5. UI & Styling Guidelines (`packages/ui`)

1. **TailwindCSS Exclusively**: Use TailwindCSS utility classes exclusively. Do not write custom CSS rules unless adding global keyframe animations in `globals.css`.
2. **Semantic Color Tokens**: Always use semantic design tokens:
   - `bg-background`, `text-foreground`
   - `bg-card`, `border-border`, `text-muted-foreground`
   - `bg-primary`, `text-primary-foreground`
   - `bg-destructive/15`, `text-destructive`
3. **Icons**: Import icons exclusively from `lucide-react`.
4. **Page Layouts**: Wrap every page view in `<PageContainer>` and use `<PageHeader>` for standard headers.

---

## 6. AI Subsystem & LLM Guardrails (`apps/api/src/modules/ai/`)

1. **System Persona & Brand Limits**:
   - The AI advisor IS FinAI. NEVER recommend external apps or Google tools (e.g. Google Sheets, Excel, Mint, YNAB).
   - Refer directly to FinAI's built-in personal features: FinAI Accounts, FinAI Transactions, FinAI Budgets, FinAI Goals, FinAI Investments, FinAI AI Advisor, and Category Manager.
   - Format all currency figures using Indian Rupees (₹).
2. **Strict Domain Scope Enforcement**:
   - The AI advisor is EXCLUSIVELY a personal financial advisor.
   - IF A USER ASKS NON-FINANCIAL QUESTIONS (e.g. politics, trivia like "who is Tamil Nadu CM", coding/programming tasks, general writing, sports, recipes), THE AI MUST POLITELY DECLINE using the standard refusal template in `prompts.config.ts`.
3. **Follow-Up Directives**:
   - Conclude interactive chat responses with 2 to 3 relevant follow-up questions under `### Follow-up Suggestions:`.

---

## 7. Workflow Checklist for AI Agents Before Committing Code

Before declaring a task resolved, every AI agent MUST verify:

- [ ] Shared types & constants reside in `@finai/shared-types` (no duplicate definitions).
- [ ] Financial formulas & math reside in `@finai/finance-engine` (zero side-effects and zero I/O).
- [ ] No inline Zod schemas created (all reside in `@finai/validation`).
- [ ] Modals adhere to the 2-file feature pattern (`<Entity>Form.tsx` + `<Entity>Dialog.tsx`).
- [ ] React Query mutations invalidate relevant user cache keys.
- [ ] Tailwind classes use semantic color tokens (no hardcoded hex values or arbitrary colors).
- [ ] Code passes typechecks (`pnpm --filter @finai/web typecheck`) and linting (`pnpm lint`).
- [ ] Seed commands were NOT run automatically — user was instructed to run them manually.

---

## 8. Database & Seed Management Rules

### Seed Script

- The seed file lives at `packages/database/prisma/seed.ts`.
- Run manually with: `pnpm --filter @finai/database db:seed`

### CRITICAL: Agents MUST NEVER run seed commands automatically

> **AI agents (Antigravity, Copilot, Claude) MUST NOT execute `db:seed`, `prisma db seed`, or any seed-related command without explicit user instruction.**

1. If seed data is missing or stale, **tell the user** and provide the exact command to run:
   ```bash
   pnpm --filter @finai/database db:seed
   ```
2. **Never auto-seed** during `db:migrate`, `db:push`, or any other automated step.
3. **Never delete or truncate** existing records. The seed script uses `upsert` exclusively.
4. If a new seed entry is needed, add it to `packages/database/prisma/seed.ts` using `upsert`, then instruct the user to run the seed manually.
