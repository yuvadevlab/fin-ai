# FinAI Core Invariants & Universal Rules

> **MANDATORY FOR ALL AI AGENTS & CODING ASSISTANTS:**
> These core rules apply to every package, language, and tool in the FinAI monorepo. They must never be bypassed.

---

## 1. Monorepo Package Boundaries & Placement

FinAI is organized into strict package boundaries. Never leak side-effects across package boundaries:

```text
finai/
├── apps/
│   ├── web/                     # Next.js 15 App Router Frontend
│   └── api/                     # NestJS 10 REST API Backend & Ollama Agent Loop
└── packages/
    ├── ai-engine/               # LLM prompts, persona, prompt builders, tool definitions & guards
    ├── finance-engine/          # Pure mathematical calculation engine (zero DB, zero HTTP, zero I/O)
    ├── shared-types/            # Shared TypeScript DTOs, interfaces, constants, and enums
    ├── validation/              # Centralized Zod validation schemas
    ├── ui/                      # Shared design system components & Radix UI primitives
    ├── database/                # Prisma ORM schema, client, and seed definitions
    └── logger/                  # Universal structured Winston logger
```

### Strict Placement Rules

- **Shared Constants & Types (`@finai/shared-types`)**: ANY constants, DTO shapes, Enums (`AccountType`, `TransactionType`, `GoalType`), or TypeScript interfaces shared across apps or packages MUST reside in `@finai/shared-types`. **NEVER duplicate types or constants across apps or packages**.
- **Financial Math (`@finai/finance-engine`)**: ALL financial calculation logic (Health Score, Net Worth, Cash Flow, Savings Rate, Budget Usage, Portfolio Asset Allocation, Goal Projections) MUST reside in `@finai/finance-engine`. **MUST contain zero side-effects, zero I/O, zero database access, and zero HTTP calls**.
- **AI Prompts & Guardrails (`@finai/ai-engine`)**: ALL system personas, prompt templates, prompt builder factory functions, follow-up parsers, and domain scope rejection rules MUST reside in `@finai/ai-engine`. API services must never define inline prompt strings.
- **Validation Schemas (`@finai/validation`)**: ALL Zod schemas for forms and API validation MUST reside in `@finai/validation`. Never define inline Zod schemas in web components or backend route handlers.
- **UI Design System (`@finai/ui`)**: Reusable presentation components, dialog primitives, gauges, and form fields MUST live in `@finai/ui`.

---

## 2. Hard Line-Count Rule — Maximum 250 Lines

1. **Strict 250-Line Maximum**: NO file in `apps/web`, `apps/api`, or packages may exceed **250 lines of code**.
2. **Proactive Decomposition**: Whenever a file approaches or exceeds **200 lines**, immediately break it down:
   - **Frontend**: Extract custom form hooks, subcomponents, item renderers, and table columns.
   - **Backend**: Extract repository queries, specialized domain workflows, and pure utility functions.
   - **Constants & Parsing**: Move domain tables, maps, regexes, and formatters into dedicated `*.constants.ts` or `*.utils.ts` files.

---

## 3. Database & Seed Management Safeguards

### CRITICAL: AI AGENTS MUST NEVER RUN SEED COMMANDS AUTOMATICALLY

> **Agents MUST NOT execute `db:seed`, `prisma db seed`, or any seed-related command without explicit user instruction.**

1. If seed data is missing or stale, **inform the user** and provide the command for them to run manually:
   ```bash
   pnpm --filter @finai/database db:seed
   ```
2. **Never auto-seed** during migrations, schema updates, or test scripts.
3. **Never delete or truncate** existing records. The seed script uses `upsert` exclusively.

---

## 4. Universal Verification Checklist

Before completing any task, verify:

- [ ] Shared types & constants reside in `@finai/shared-types` (no duplicates).
- [ ] Zod schemas reside in `@finai/validation` (no inline schemas).
- [ ] Financial calculations reside in `@finai/finance-engine` (pure functions, zero I/O).
- [ ] No file exceeds 250 lines of code (split proactively at 200 lines).
- [ ] Typechecks pass: `pnpm --filter @finai/api typecheck` and `pnpm --filter @finai/web typecheck`.
- [ ] No database seed commands were executed automatically.
