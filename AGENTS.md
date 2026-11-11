# FinAI Monorepo — AI Agent Guidelines & Architecture Index

> **FOR ALL AI ASSISTANTS (Antigravity, GitHub Copilot, Claude Code):**
> This repository uses a modular rules architecture. Master invariants are listed below, and domain-specific rulebooks are imported from `.agents/rules/`.

---

## 1. Modular Rulebook Index

All AI agents must inspect and adhere to the relevant topic rulebooks:

| Topic                         | Rulebook                                                                   | Primary Scope                                                  |
| :---------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **Universal Core Invariants** | [`00-core-invariants.md`](file:///.agents/rules/00-core-invariants.md)     | Monorepo boundaries, 250-line rule, seed safeguards            |
| **Frontend & Web**            | [`01-frontend-web.md`](file:///.agents/rules/01-frontend-web.md)           | 2-file modals, React Query, design system tokens, `@finai/ui`  |
| **Backend API**               | [`02-backend-api.md`](file:///.agents/rules/02-backend-api.md)             | 5-layer NestJS architecture, controllers, repositories, utils  |
| **AI Advisor & Agent Loop**   | [`03-ai-advisor.md`](file:///.agents/rules/03-ai-advisor.md)               | `@finai/ai-engine`, persona, safety guardrails, 2-phase writes |
| **Testing Standards**         | [`04-testing-standards.md`](file:///.agents/rules/04-testing-standards.md) | Vitest, Playwright, mock contracts, zero test side-effects     |

---

## 2. Universal Monorepo Invariants (Zero Exceptions)

0. **Zero Commits Without Explicit Confirmation (CRITICAL)**:
   - NEVER execute `git commit`, `git push`, or open pull requests in ANY repository unless the user explicitly commands it in the current turn (e.g. "commit these changes", "commit and push").
   - Directives like "start", "proceed", "fix this", "implement", "build", or "test" authorize implementation, building, and running tests ONLY.
   - Always leave changes staged or in the working tree, present verification results, and wait for confirmation.
1. **Organization Standards & `.github` Inheritance**:
   - Standardize all author and committer attribution to `yuva.devlab@gmail.com`.
   - Branch naming must strictly follow: `^(feat|fix|refactor|perf|chore|docs|test|ci|hotfix)/[a-z0-9-]+$`.
   - PR descriptions must adhere to the 5-section high-signal standard defined in `yuvadevlab/.github` (Summary, Changes, How to Test, Proof of Verification, Risks).
   - Commits must conform to Conventional Commits: `<type>(<optional-scope>): <imperative summary>`.
2. **Pure Platform CSS & Design Tokens**:
   - Utility-first CSS frameworks are prohibited. All styling is implemented using pure platform CSS, W3C Cascade Layers (`@layer dl-*`), and design tokens from `@yuva-devlab/tokens`.
3. **Strict Package Boundaries & Single Source of Truth**:
   - Shared types, constants, enums, `QUERY_KEYS`, `API_ENDPOINTS`, and `SEARCH_PARAMS` MUST live in `@finai/shared-types`. Never duplicate cross-package contracts or inline raw string query keys.
   - Application route paths (`APP_ROUTES`, `API_ROUTES`) MUST live in `@/lib/routes.ts`. Never hardcode raw URLs.
   - User-facing text in the web app MUST live in `@/lib/ui-copy/` dictionaries. Zero hardcoded UI copy strings.
   - Financial mathematics MUST live in `@finai/finance-engine` as pure functions with zero DB, HTTP, or side-effects.
   - LLM prompts, personas, and templates MUST live in `@finai/prompts` (LLM runtime models, agent loop, and stream parsing live in `@finai/ai-engine`).
   - Zod validation schemas MUST live in `@finai/validation`. Never create inline Zod schemas in web or API.
4. **Standardized Backend Logging (`.info`, `.warn`, `.error` ONLY)**:
   - Use ONLY `.info`, `.warn`, and `.error` log levels across `apps/api` and packages.
   - NEVER use `.debug`, `.log`, `.verbose`, or `.trace`.
   - `new Logger(ClassName.name)` already prepends `[ClassName]`. Do NOT repeat the class name in the message payload. Prefix with the method/action tag only: `[methodName] message`.
5. **Barrel Imports & Next.js RSC Boundary Discipline**:
   - Use barrel imports for consuming feature modules and libraries (`@/features/<feature>`, `@/lib`).
   - Next.js Server Components (`layout.tsx`, server `page.tsx`) must NOT import from barrels that re-export client hooks without `"use client"`. Import client components from `@/features/<feature>/components` or `@/features/<feature>/context`.
   - All custom React hooks and interactive components must declare `"use client";` at line 1.
6. **Hard 250-Line Maximum Rule**:
   - NO file across `apps/web`, `apps/api`, or `packages/ui` may exceed **250 lines of code**.
   - Whenever a file approaches or reaches **200 lines**, decompose it immediately.
7. **Database Seed Safeguards**:
   - **AGENTS MUST NEVER RUN SEED COMMANDS AUTOMATICALLY.**
   - If seed data is missing, instruct the user to run `pnpm --filter @finai/database db:seed` manually.
8. **Pre-Commit Verification**:
   - Run typechecks (`pnpm --filter @finai/api typecheck` and `pnpm --filter @finai/web typecheck`).
   - Run production build (`pnpm build` / `turbo build`).
   - Ensure all files adhere strictly to their respective layer and line-count limits.
9. **Next.js Page & Layout Invariant (Pure SSR Wrappers)**:
   - All `page.tsx` and `layout.tsx` files across Next.js apps MUST remain Server Components (`SSR`).
   - NEVER mark `page.tsx` or `layout.tsx` with `"use client"`.
   - Pages and layouts act strictly as server wrappers (handling metadata, SSR prefetching, server fetching, and rendering client view components).
   - All interactive client logic, state, and browser APIs must reside in dedicated client components under `src/features/<feature>/components/`.
   - All authentication routes must be grouped under `app/(auth)/...`.

10. **Feature-Scoped TanStack Query Hook Encapsulation**: Direct inline calls to `useQuery`, `useMutation`, or raw `apiClient`/`fetch` calls inside UI components are strictly forbidden. All server state queries, mutations, query keys, and SSR prefetch helpers must be encapsulated in dedicated files under `features/<feature>/api/` (e.g., `getAccounts.ts`, `createAccount.ts`). Each hook module must export: canonical `<resource>QueryKey()`, custom hook `use<Resource>()` or `use<Action>()`, and optional `prefetch<Resource>()`. Components must exclusively consume these exported custom hooks.

11. **Strict `UI_COPY` Centralization Invariant (Zero Exceptions)**:
    - ALL user-facing text (labels, headers, button text, placeholders, empty states, error messages, toast copy, and dialog descriptions) MUST be centralized in `@/lib/ui-copy/` dictionaries.
    - Direct raw hardcoded strings in JSX/TSX components are strictly prohibited.
