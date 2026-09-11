# FinAI Monorepo — AI Agent Guidelines & Architecture Index

> **FOR ALL AI ASSISTANTS (Antigravity, GitHub Copilot, Claude Code):**
> This repository uses a modular rules architecture. Master invariants are listed below, and domain-specific rulebooks are imported from `.agents/rules/`.

---

## 1. Modular Rulebook Index

All AI agents must inspect and adhere to the relevant topic rulebooks:

| Topic                         | Rulebook                                                                   | Primary Scope                                                  |
| :---------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **Universal Core Invariants** | [`00-core-invariants.md`](file:///.agents/rules/00-core-invariants.md)     | Monorepo boundaries, 250-line rule, seed safeguards            |
| **Frontend & Web**            | [`01-frontend-web.md`](file:///.agents/rules/01-frontend-web.md)           | 2-file modals, React Query, Tailwind tokens, `@finai/ui`       |
| **Backend API**               | [`02-backend-api.md`](file:///.agents/rules/02-backend-api.md)             | 5-layer NestJS architecture, controllers, repositories, utils  |
| **AI Advisor & Agent Loop**   | [`03-ai-advisor.md`](file:///.agents/rules/03-ai-advisor.md)               | `@finai/ai-engine`, persona, safety guardrails, 2-phase writes |
| **Testing Standards**         | [`04-testing-standards.md`](file:///.agents/rules/04-testing-standards.md) | Vitest, Playwright, mock contracts, zero test side-effects     |

---

## 2. Universal Monorepo Invariants (Zero Exceptions)

1. **Strict Package Boundaries**:
   - Shared types, constants, and enums MUST live in `@finai/shared-types`. Never duplicate cross-package contracts.
   - Financial mathematics MUST live in `@finai/finance-engine` as pure functions with zero DB, HTTP, or side-effects.
   - LLM prompts, personas, and templates MUST live in `@finai/ai-engine`.
   - Zod validation schemas MUST live in `@finai/validation`. Never create inline Zod schemas in web or API.
2. **Hard 250-Line Maximum Rule**:
   - NO file across `apps/web`, `apps/api`, or `packages/ui` may exceed **250 lines of code**.
   - Whenever a file approaches or reaches **200 lines**, decompose it immediately.
3. **Database Seed Safeguards**:
   - **AGENTS MUST NEVER RUN SEED COMMANDS AUTOMATICALLY.**
   - If seed data is missing, instruct the user to run `pnpm --filter @finai/database db:seed` manually.
4. **Pre-Commit Verification**:
   - Run typechecks (`pnpm --filter @finai/api typecheck` and `pnpm --filter @finai/web typecheck`).
   - Ensure all files adhere strictly to their respective layer and line-count limits.
