# FinAI — Enterprise AI Financial Intelligence Monorepo

FinAI is a modern, full-stack, AI-powered personal and family finance management platform. It enables real-time net worth tracking, automated cash flow calculations, budget adherence scoring, investment portfolio tracking, financial goal projections, and local LLM AI advisory services powered by Ollama.

---

## Workspace Documentation Directory

Click any link below to navigate to the standalone documentation for that application or package:

### Applications (`apps/`)

- 📱 **[`apps/web`](apps/web/README.md)**: Next.js 15 App Router frontend application with `@finai/ui` primitives, React Query, and standalone Docker optimization.
- ⚙️ **[`apps/api`](apps/api/README.md)**: NestJS 10 REST API backend service with Prisma ORM, Passport.js JWT authentication, and native Windows Ollama LLM integration.

### Packages (`packages/`)

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

---

## Deployment Summary (Windows Server `D:\server\repos\fin-ai`)

To deploy FinAI on Windows Server, execute:

```powershell
cd D:\server\repos\fin-ai
powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1
```
