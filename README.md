# FinAI — Enterprise AI Financial Intelligence Monorepo

FinAI is a modern, full-stack, AI-powered personal and family finance management platform. It enables real-time net worth tracking, automated cash flow calculations, budget adherence scoring, investment portfolio tracking, financial goal projections, and local LLM AI advisory services powered by Ollama.

---

## Workspace Coding Standards & Agent Guidelines (`.agents/AGENTS.md`)

Before writing or modifying code in FinAI, review the official [**`FinAI Coding Standards & Agent Guidelines`**](.agents/AGENTS.md):

- 📐 **2-File Feature Modal Pattern**: `<Entity>Form.tsx` (pure presentation using `<FormDialogField>`) + `<Entity>Dialog.tsx` (Zod `safeParse()` validation, React Query mutations).
- 🧮 **Pure Finance Engine**: `@finai/finance-engine` MUST contain **zero side-effects and zero I/O**.
- ✅ **Centralized Validation**: ALL validation schemas MUST reside in `@finai/validation` and use `.safeParse()`.
- 🔄 **State & Cache**: Feature hooks under `src/features/<name>/api/` using `@tanstack/react-query` with automatic `invalidateQueries()`.
- 🎨 **Styling**: TailwindCSS semantic color tokens (`bg-card`, `bg-background`, `border-border`, `text-destructive`) and Lucide icons.

---

## System Architecture & Product Specifications (`docs/`)

Explore the comprehensive technical & product specifications for every module, page, formula, API route, and component in the application:

- 🗺️ **[`Master Architecture & Index`](docs/00_INDEX_AND_ARCHITECTURE_MAP.md)**: Overall system map, data flow diagram, and developer quickstart.
- 📦 **[`Monorepo & Packages`](docs/01_MONOREPO_AND_PACKAGES.md)**: Package boundaries, `@finai/finance-engine` formulas, UI primitives, and Prisma DB schema.
- 🎨 **[`Layout Shell & Header`](docs/02_LAYOUT_SHELL_AND_HEADER.md)**: `DashboardShell`, `TopBar`, `ProfileMenu` profile sync, `WorkspaceMenu`, and `AppearanceProvider`.
- 📊 **[`Dashboard Module`](docs/03_DASHBOARD_MODULE.md)**: Financial Health Score formula, KPI stats grid, and live AI insights.
- 💳 **[`Transactions Ledger`](docs/04_TRANSACTIONS_MODULE.md)**: Server-side pagination, `DataTable`, custom `Pagination` component, and `TransactionDialog`.
- 🎯 **[`Budgets & Expenses`](docs/05_BUDGETS_AND_EXPENSES_MODULE.md)**: Category spending caps, budget risk color status badges, and remaining balance math.
- 📈 **[`Investments Portfolio`](docs/06_INVESTMENTS_PORTFOLIO_MODULE.md)**: 9 asset classes, asset distribution pie, and unrealized P&L math.
- 🏆 **[`Savings Goals`](docs/07_GOALS_SAVINGS_MODULE.md)**: Personal vs family goals (`GoalType`), target deadline completion projections, and contribution dialog.
- 📉 **[`Financial Reports`](docs/08_REPORTS_AND_ANALYTICS_MODULE.md)**: Income vs expense comparison, category pie breakdown, and monthly variance analysis.
- 👨‍👩‍👧‍👦 **[`Family Workspace`](docs/09_FAMILY_WORKSPACE_MODULE.md)**: Household shared budgets, member access roles (`OWNER`, `ADMIN`, `MEMBER`), and invitation workflows.
- 🤖 **[`AI Advisor & LLM Engine`](docs/10_AI_ADVISOR_AND_LLM_ENGINE.md)**: NestJS SSE streaming, Ollama LLM, PostgreSQL chat history, GFM markdown tables with `remark-gfm`, 1-click follow-up buttons, relative timestamps, and AI scope guardrails.
- ⚙️ **[`Settings & Preferences`](docs/11_SETTINGS_AND_PREFERENCES.md)**: Feature flag filtering (`SETTING_FLAGS`), section deep-linking (`/settings?section=*`), 2-file feature pattern, and theme/density DOM switcher.
- 🚀 **[`Architecture Audit & Roadmap`](docs/12_SYSTEM_ARCHITECTURE_IMPROVEMENTS_ROADMAP.md)**: Potential bottlenecks ("path holes"), microservices splitting strategy, database scaling, performance optimizations, and feature roadmap.

---

## Workspace Documentation Directory

Click any link below to navigate to the standalone documentation for that application or package:

### Applications (`apps/`)

- 📱 **[`apps/web`](apps/web/README.md)**: Next.js 15 App Router frontend application with `@finai/ui` primitives, React Query, and standalone Docker optimization.
- ⚙️ **[`apps/api`](apps/api/README.md)**: NestJS 10 REST API backend service with Prisma ORM, Passport.js JWT authentication, and native Windows Ollama LLM integration.

### Packages (`packages/`)

- 🤖 **`packages/ai-engine`**: **Shared LLM Engine & Prompt Engineering** — System personas, prompt builder factories, follow-up parsers, and domain safety guardrails.
- 🧮 **[`packages/finance-engine`](packages/finance-engine/README.md)**: **Core Financial Mathematics & Metrics Engine** — Detailed mathematical formulas for Health Score (0-100), Net Worth, Savings Rate, Cash Flow, Budget Variance, Asset Allocation, and Goal Projections.
- 🗄️ **[`packages/database`](packages/database/README.md)**: PostgreSQL database schema, Prisma Client engine, migration scripts, and seed data.
- 🎨 **[`packages/ui`](packages/ui/README.md)**: Shared React component library built with TailwindCSS, Radix UI primitives, `<FormDialog>`, and `<FormDialogField>`.
- ✅ **[`packages/validation`](packages/validation/README.md)**: Zod validation schemas and type inferences shared across forms and API DTOs.
- 🏷️ **[`packages/shared-types`](packages/shared-types/README.md)**: Shared TypeScript interfaces, enums (`AccountType`, `TransactionType`), and API payload types.

### Infrastructure & Docker Manuals

- 📖 **[`DevOps Master Guide`](docs/DEVOPS_MASTER_GUIDE.md)**: Master production Docker guide for Windows Server hosting (`D:\server\repos\fin-ai`).
- 🐳 **[`docker-compose.yml`](docker-compose.yml)**: Multi-container orchestration (PostgreSQL, NestJS API, Next.js Web, Nginx reverse proxy).

---

## Monorepo Architecture Map

```text
fin-ai/
├── apps/
│   ├── api/                   # NestJS Backend API Service
│   └── web/                   # Next.js 15 Standalone Frontend
│
├── packages/
│   ├── database/              # Prisma Database Engine & Schema
│   ├── finance-engine/        # Financial Metric Calculations & Algorithms
│   ├── shared-types/          # TypeScript Types & Interfaces
│   ├── ui/                    # Shared Tailwind + Radix React Components
│   └── validation/            # Zod Form & API Validation Schemas
│
├── .agents/
│   └── AGENTS.md              # Workspace Coding Standards & Agent Guidelines
│
├── docs/                      # Technical & Product Architecture Specifications
│
├── docker/
│   ├── api/Dockerfile         # Multi-stage NestJS Dockerfile
│   ├── web/Dockerfile         # Multi-stage Next.js Dockerfile
│   └── nginx/                 # Nginx Reverse Proxy & SSL Setup
│
├── .github/workflows/         # Code Quality CI Workflow (build.yml)
├── docker-compose.yml         # Production Container Orchestration
├── package.json               # Root Workspace Scripts
├── pnpm-workspace.yaml        # Monorepo Workspace Configuration
└── turbo.json                 # Turbo Build Pipeline Cache Engine
```

---

## Quickstart Commands

```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Generate Prisma Client
pnpm db:generate

# 3. Start development environment (Turbo pipeline)
pnpm dev

# 4. Run linting, typechecking & unit tests across workspace
pnpm check

# 5. Build production workspace artifacts
pnpm build
```
