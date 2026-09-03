---

## 10. Testing Standards & Conventions

To maintain a robust and scalable codebase, the following testing layers MUST be implemented for every new feature:

### 10.1 Pure Calculation & Logic Tests (`Vitest`)

- **Finance Engine (`@finai/finance-engine`)**: Pure mathematical tests. Zero I/O.
- **Validation (`@finai/validation`)**: Zod schema tests. Verify both positive and negative boundary cases using `.safeParse()`.
- **AI Engine (`@finai/ai-engine`)**: Prompt building and parsing logic tests.

### 10.2 UI Component Tests (`Vitest` + `React Testing Library`)

- **Design System (`@finai/ui`)**: Test accessible rendering, styling tokens, and basic interactions in JSDOM.
- **Web Components (`apps/web`)**: Test feature-specific components, mocking Next.js navigation and browser APIs (ResizeObserver, etc.).

### 10.3 Backend API Tests (`Vitest` + `@nestjs/testing`)

- **Unit Tests**: Test services by mocking the `PrismaService` and external dependencies.
- **Integration Tests**: Verify controller endpoints and request/response flow.

### 10.4 End-to-End Tests (`Playwright`)

- **Smoke Tests**: Verify critical paths (e.g., Page Load, Theme Toggle, Responsive Navigation).
- **Regression Tests**: Ensure core user flows (e.g., Account Creation $\rightarrow$ Transaction Entry) are functional.
- **Configuration**: Always use the Chromium matrix and automatic web server launch via `playwright.config.ts`.

### 10.5 Execution Commands

- `pnpm test`: Run all unit/integration tests across the monorepo (Turbo cached).
- `pnpm test:e2e`: Run Playwright E2E smoke and regression tests.
