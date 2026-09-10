# FinAI Copilot Instructions

> All GitHub Copilot interactions in FinAI must adhere to the monorepo architecture:
>
> - Master Guidelines: [AGENTS.md](../AGENTS.md)
> - Core Invariants: [.agents/rules/00-core-invariants.md](../.agents/rules/00-core-invariants.md)

For specialized tasks, invoke or reference the appropriate role agent from `.github/agents/`:

- `@FinAI Frontend Expert`: Next.js 15, Tailwind UI, React Query, 2-file modals
- `@FinAI Backend Engineer`: NestJS 10, 5-layer architecture, controllers, services, repositories
- `@FinAI AI Engineer`: `@finai/ai-engine`, LLM prompts, tool execution loop
- `@FinAI Tester`: Vitest unit tests, Playwright E2E browser journeys
