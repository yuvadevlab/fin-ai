# FinAI Frontend & Web Architecture Rules (`apps/web`)

> **Scope**: Applies to `apps/web` (Next.js 15 App Router) and `@finai/ui`.

---

## 1. Feature Directory Layout

All feature logic in `apps/web` must be organized strictly under `src/features/<feature-name>/`:

```text
src/features/<feature-name>/
├── api/                     # React Query hooks (useGet<Entity>.ts, useCreate<Entity>.ts)
├── components/              # Feature UI components, form & dialog components
├── hooks/                   # Feature-specific state and custom hooks
└── utils/                   # Feature-specific pure helpers and formatters
```

---

## 2. Standard 2-File Feature Modal Pattern

All data entry dialogs in `apps/web` MUST follow the standardized **2-file feature pattern**:

```text
src/features/<feature-name>/components/
├── <Entity>Form.tsx         # Pure form fields presentation component
└── <Entity>Dialog.tsx       # Modal wrapper, Zod validation, and React Query mutation
```

### Rule 1: Form Component (`<Entity>Form.tsx`)

1. Include `"use client"` at the top.
2. Accept `values`, `errors`, and `onChange` props typed via interface.
3. Define an array of `FormField` objects from `@finai/ui`.
4. Render fields using `<FormDialogField />`.

### Rule 2: Dialog Component (`<Entity>Dialog.tsx`)

1. Support both controlled (`open`, `onOpenChange`) and uncontrolled state via fallback (`useState`).
2. Retrieve workspace/user state via `useWorkspace()`.
3. Import the Zod validation schema from `@finai/validation` and validate with `schema.safeParse()`.
4. Map validation issues to field error state:
   ```ts
   parseResult.error.issues.forEach((issue) => {
     const fieldName = issue.path[0] as string;
     fieldErrors[fieldName] = issue.message;
   });
   ```
5. Clear field errors on `onChange` event.
6. Wrap in `<FormDialog>` from `@finai/ui` and render root error alert when `errors.root` exists.

---

## 3. State Management & API Hooks

1. **Location**: Place feature API hooks under `src/features/<feature-name>/api/`.
2. **React Query**: Use `@tanstack/react-query` (`useQuery`, `useMutation`).
3. **Centralized Query Keys**: Use `QUERY_KEYS` from `@finai/shared-types`. NEVER use inline raw string arrays:
   ```ts
   // CORRECT:
   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS.ALL });

   // FORBIDDEN:
   queryClient.invalidateQueries({ queryKey: ["transactions"] });
   ```
4. **Centralized API Endpoints**: Use `API_ENDPOINTS` from `@finai/shared-types` or `API_ROUTES` from `@/lib/routes`. Never hardcode raw endpoint URLs.
5. **Optimistic Updates**: Use optimistic updates only for simple toggle or deletion actions with immediate rollback on error.

---

## 4. Barrel Imports & Next.js RSC Boundary Discipline

1. **Barrel Imports**: Always use barrel imports for feature consumers and common utilities:
   ```ts
   // CORRECT:
   import { UI_COPY, APP_ROUTES } from "@/lib";
   import { AiAdvisorPage } from "@/features/ai-advisor/components";

   // FORBIDDEN:
   import { UI_COPY } from "../../../lib/ui-copy/advisor";
   ```
2. **RSC Server Boundaries**:
   - Next.js Server Components (such as dashboard `layout.tsx` or `page.tsx` exporting `metadata`) must NOT import from barrels that re-export client hooks (`use*`).
   - Import client components from `@/features/<feature>/components` or `@/features/<feature>/context` to preserve clean server/client compilation boundaries.
3. **Mandatory `"use client"` Directive**:
   - Every custom React hook using `useState`, `useEffect`, `useRef`, or `useCallback` MUST have `"use client";` on line 1.
   - Every interactive component rendering forms, buttons, or dialogs MUST have `"use client";` on line 1.

---

## 5. UI Copy Dictionaries (Zero Hardcoded Text)

1. **Catalog Location**: All user-facing strings must reside in `@/lib/ui-copy/`.
2. **Dictionary Structure**: Group strings by feature and section (`UI_COPY.<FEATURE>.<SECTION>`).
3. **Components**: Components must read copy exclusively from `UI_COPY`. No inline hardcoded strings for button labels, card headers, empty states, or dialog bodies.

---

## 6. UI & Styling Guidelines (`packages/ui`)

1. **TailwindCSS Exclusively**: Use semantic Tailwind utility tokens. Never use hardcoded arbitrary hex values.
   - Backgrounds & Foreground: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`
   - Primary: `bg-primary`, `text-primary-foreground`
   - Destructive / Error: `bg-destructive/15`, `text-destructive`
2. **Icons**: Import icons exclusively from `lucide-react`.
3. **Page Layouts**: Wrap every page view in `<PageContainer>` and use `<PageHeader>` for standard headers.
4. **No Inline Graphic SVGs in Pages**: Complex graphic SVGs (gauges, progress dials) must live in `@finai/ui` as reusable, accessible components (with `role="progressbar"`, `aria-valuenow`, `aria-label`).
