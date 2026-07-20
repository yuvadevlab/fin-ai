# @finai/web

`@finai/web` is the user-facing web application for FinAI, built with Next.js 15 (App Router), React 19, TailwindCSS, `@finai/ui`, `@finai/validation`, and `@tanstack/react-query`.

---

## Directory Structure

```text
apps/web/
├── src/
│   ├── app/                      # Next.js App Router pages & API route proxies
│   │   ├── (dashboard)/          # Dashboard layout & authenticated feature pages
│   │   │   ├── accounts/         # Accounts page
│   │   │   ├── ai-advisor/       # AI insights page
│   │   │   ├── budgets/          # Budget management page
│   │   │   ├── categories/       # Category management page
│   │   │   ├── goals/            # Financial goals page
│   │   │   ├── investments/      # Investment portfolio page
│   │   │   ├── reports/          # Financial reporting page
│   │   │   └── transactions/     # Transaction ledger page
│   │   ├── layout.tsx            # Root HTML & provider wrap
│   │   └── page.tsx              # Landing / entry redirect
│   │
│   ├── features/                 # Modular domain features
│   │   ├── accounts/             # Account components, dialogs, forms & hooks
│   │   ├── ai-advisor/           # AI advice UI & streaming cards
│   │   ├── budgets/              # Budget cards, dialogs & usage progress
│   │   ├── categories/           # Category badges & forms
│   │   ├── dashboard/            # Overview metrics, charts & shells
│   │   ├── goals/                # Financial target progress & dialogs
│   │   ├── investments/          # Allocation charts & investment dialogs
│   │   ├── reports/              # Custom report builder & filters
│   │   └── transactions/         # Transaction table, filters & dialogs
│   │
│   ├── lib/                      # API client, server fetch utilities & formatters
│   │   ├── api-client.ts         # Axios/Fetch HTTP client for NestJS API
│   │   └── server-fetch.ts       # Server component data fetching wrapper
│   │
│   └── providers/                # React Context Providers (Workspace, Query, Auth)
│
├── next.config.ts                # Next.js configuration with standalone build output
├── package.json
└── tsconfig.json
```

---

## Key Feature Component Patterns

### 1. Form & Dialog Pattern (`<FormDialog>` + `<FormDialogField>`)

All data entry forms follow a clean, standardized 2-file pattern:

1. **`*Form.tsx`**: Renders pure field components (`FormDialogField`) driven by a field specification array (`FormField[]`).
2. **`*Dialog.tsx`**: Controls modal state, validates input with Zod (`safeParse`), executes TanStack Query mutations (`useMutation`), and displays server/validation errors.

### Example Form Implementation (`AccountForm.tsx`)

```tsx
import { FormDialogField, FormField } from "@finai/ui";

export function AccountForm({ values, errors, onChange }: AccountFormProps) {
  const fields: FormField[] = [
    { type: "text", name: "name", label: "Account Name", placeholder: "e.g. HDFC Bank" },
    {
      type: "select",
      name: "type",
      label: "Account Type",
      options: [
        { label: "Bank Account", value: "BANK" },
        { label: "Credit Card", value: "CREDIT_CARD" },
      ],
    },
    { type: "number", name: "balance", label: "Balance", placeholder: "0.00" },
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

## Standalone Docker Build

This application is configured for minimal production Docker containerization via Next.js standalone build mode in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@finai/ui",
    "@finai/finance-engine",
    "@finai/validation",
    "@finai/shared-types",
  ],
};
```

---

## Running Locally

```bash
# Start development server on port 3000
pnpm --filter @finai/web dev

# Build standalone production bundle
pnpm --filter @finai/web build
```
