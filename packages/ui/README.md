# @finai/ui

`@finai/ui` is the shared React component library for FinAI, built on top of `@yuva-devlab/ui` primitives, Tailwind CSS v4, Lucide icons, and Recharts.

---

## Component Architecture

```text
packages/ui/
├── src/
│   ├── charts/                   # Recharts wrappers (CashFlow, TrendLine, CategoryPie)
│   ├── components/               # High-level domain & display components
│   │   ├── ConfirmDialog.tsx     # Confirmation dialog modal
│   │   ├── DataTable.tsx         # Data table with pagination and sorting
│   │   ├── FormDialog.tsx        # Standardized form dialog container
│   │   ├── FormDialogField.tsx   # Dynamic form input, select & textarea field renderer
│   │   ├── PageContainer.tsx     # Standardized page wrapper
│   │   └── PageHeader.tsx        # Title, description, and action button bar
│   ├── layouts/                  # AppShell, Sidebar, TopBar navigation layouts
│   ├── styles.css                # Imports @yuva-devlab/ui preset & finai theme
│   └── index.ts                  # Re-exports domain components + @yuva-devlab/ui primitives
```

---

## Core Component Highlights

### 1. `<FormDialog>`

Standardized modal component wrapping forms with title, description, submit button with loading spinner, and cancel handler.

```tsx
import { FormDialog } from "@finai/ui";

<FormDialog
  open={open}
  onOpenChange={setOpen}
  title="Link Account"
  description="Add a new bank account or wallet."
  submitLabel="Save Account"
  loading={isSubmitting}
  onSubmit={handleSubmit}
>
  {/* Form fields */}
</FormDialog>;
```

### 2. `<FormDialogField>`

Generic field renderer supporting `"text"`, `"number"`, `"select"`, `"textarea"`, and `"date"`, mapping field validation errors automatically.

```tsx
import { FormDialogField } from "@finai/ui";

<FormDialogField
  field={{
    type: "select",
    name: "type",
    label: "Account Type",
    options: [{ label: "Bank Account", value: "BANK" }],
  }}
  value={values.type}
  error={errors.type}
  onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
/>;
```

---

## Building the UI Package

```bash
# Build UI assets & CSS using Vite / tsup
pnpm --filter @finai/ui build
```
