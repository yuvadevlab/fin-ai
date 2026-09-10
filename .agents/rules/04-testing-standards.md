# FinAI Testing Standards & Conventions

> **Scope**: Applies to all packages and applications across the FinAI monorepo.

---

## 1. Testing Frameworks

| Layer                   | Tool         | Location                                        | Command                                    |
| :---------------------- | :----------- | :---------------------------------------------- | :----------------------------------------- |
| **Pure Engines**        | Vitest       | `packages/finance-engine`, `packages/ai-engine` | `pnpm --filter @finai/finance-engine test` |
| **Backend API**         | Vitest       | `apps/api/src/**/*.spec.ts`                     | `pnpm --filter @finai/api test`            |
| **Frontend Components** | Vitest + RTL | `apps/web/src/**/*.test.tsx`                    | `pnpm --filter @finai/web test`            |
| **E2E Browser Flows**   | Playwright   | `apps/web/e2e/**/*.spec.ts`                     | `pnpm --filter @finai/web test:e2e`        |

---

## 2. Unit Testing Principles

1. **Pure Engine Isolation**: Pure math in `@finai/finance-engine` and prompt builders in `@finai/ai-engine` must be thoroughly covered with deterministic unit tests.
2. **Mocking External Dependencies**:
   - **Prisma**: In unit tests, mock `PrismaService` via jest-mock/vitest mocks. Never hit the live database during unit tests.
   - **Ollama / LLMs**: In agent tests, mock the streaming client using recorded SSE chunks or deterministic mock generators.
   - **HTTP / APIs**: Use MSW (Mock Service Worker) or mocked `fetch` handlers.
3. **Co-location**: Unit test files should sit immediately adjacent to the file they test:
   - `date-expression.ts` -> `date-expression.spec.ts`
   - `InvestmentForm.tsx` -> `InvestmentForm.test.tsx`

---

## 3. End-to-End (E2E) Testing Principles

1. **User Journey Focus**: Playwright tests should test end-to-end user workflows (e.g., login -> link account -> record transaction -> verify balance and dashboard KPI update).
2. **Selector Best Practices**: Prefer accessible user-facing selectors:
   - `getByRole('button', { name: /link account/i })`
   - `getByLabelText(/account name/i)`
   - Avoid brittle CSS class selectors or dynamic DOM paths.
3. **No Automatic Database Seeding**: Never trigger `db:seed` or `prisma db seed` within test scripts without explicit user consent.
