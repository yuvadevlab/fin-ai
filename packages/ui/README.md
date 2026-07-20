# @finai/ui

`@finai/ui` is the shared React component library for FinAI, built with TailwindCSS, Radix UI primitives, Lucide icons, Class Variance Authority (`cva`), and `clsx`.

---

## Component Architecture

```text
packages/ui/
├── src/
│   ├── primitives/               # Radix UI wrapper primitives
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── tooltip.tsx
│   │
│   ├── components/               # High-level layout & modal components
│   │   ├── ConfirmDialog.tsx     # Confirmation dialog modal
│   │   ├── FormDialog.tsx        # Standardized form dialog container
│   │   ├── FormDialogField.tsx   # Dynamic form input, select & textarea field renderer
│   │   ├── PageContainer.tsx     # Standardized page wrapper
│   │   └── PageHeader.tsx        # Title, description, and action button bar
│   │
│   └── styles/                   # CSS theme tokens & Tailwind imports
│       └── globals.css
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
