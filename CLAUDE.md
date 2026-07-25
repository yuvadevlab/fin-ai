# FinAI — Claude Code Assistant Guidelines

Please adhere strictly to the monorepo conventions and architecture guidelines defined in [**`.agents/AGENTS.md`**](.agents/AGENTS.md):

1. **Package Boundaries**:
   - `@finai/finance-engine`: MUST contain **zero side-effects and zero I/O**.
   - `@finai/validation`: Centralized single source of truth for ALL Zod validation schemas.

2. **2-File Feature Modal Pattern**:
   - Every data entry modal in `@finai/web` MUST use `<Entity>Form.tsx` (pure presentation rendering fields via `<FormDialogField>`) + `<Entity>Dialog.tsx` (modal wrapper, Zod `safeParse()` validation, React Query mutations).

3. **Validation & State Management**:
   - Use `.safeParse()` for Zod validation.
   - Place feature hooks under `src/features/<feature-name>/api/`.
   - Invalidate related React Query cache keys on mutation success (`queryClient.invalidateQueries()`).

4. **Styling**:
   - Use TailwindCSS semantic color tokens exclusively (`bg-card`, `bg-background`, `border-border`, `text-destructive`).
   - Import icons exclusively from `lucide-react`.

For complete details, refer to [**`AGENTS.md`**](AGENTS.md) and [**`docs/00_INDEX_AND_ARCHITECTURE_MAP.md`**](docs/00_INDEX_AND_ARCHITECTURE_MAP.md).
