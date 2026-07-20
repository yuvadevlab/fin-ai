# @finai/api

`@finai/api` is the primary backend REST/GraphQL service for FinAI, built with NestJS 10, Node.js 24, Prisma ORM (`@finai/database`), Passport.js JWT authentication, and native Ollama AI integration.

---

## Directory Structure

```text
apps/api/
├── src/
│   ├── modules/                  # Feature domain modules
│   │   ├── accounts/             # Bank, card & wallet balance endpoints
│   │   ├── ai-advisor/           # Ollama LLM prompt runner & financial advice
│   │   ├── auth/                 # JWT sign/verify, passport strategies & login
│   │   ├── budgets/              # Budget limits & tracking endpoints
│   │   ├── categories/           # Custom category CRUD
│   │   ├── goals/                # Financial goal targets & projection engine
│   │   ├── health/               # API health check endpoint (/api/health)
│   │   ├── investments/          # Asset tracking & portfolio valuation
│   │   ├── reports/              # Summary analytics & export generation
│   │   ├── transactions/         # Ledger CRUD, filters & calculations
│   │   └── workspaces/           # Multi-tenant workspace management
│   │
│   ├── common/                   # Shared filters, interceptors, guards & decorators
│   │   ├── decorators/           # Custom param decorators (@CurrentUser)
│   │   ├── filters/              # Global HttpExceptionFilter
│   │   ├── guards/               # JwtAuthGuard, RolesGuard
│   │   └── interceptors/         # TransformInterceptor, LoggingInterceptor
│   │
│   ├── main.ts                   # Application bootstrap entrypoint
│   └── app.module.ts             # Master root module importing feature modules
│
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Architecture & Core Features

### 1. Database ORM (`@finai/database`)

The API uses Prisma Client generated from `@finai/database`. Data models include `Workspace`, `User`, `Account`, `Transaction`, `Budget`, `Investment`, and `Goal`.

### 2. Ollama AI Integration Engine

The AI Advisor module interacts with the host-native Ollama LLM service via HTTP:

```text
http://host.docker.internal:11434
```

It fetches transactions, budget adherence, and net worth calculations from `@finai/finance-engine`, constructs structured system prompts, and streams back tailored financial recommendations.

### 3. Global Health Check Endpoint

To support Docker Compose and Nginx health checks, the API provides an unauthenticated health endpoint:

```text
GET /api/health
Response: { "status": "ok", "timestamp": "2026-07-20T10:00:00Z" }
```

---

## Environment Variables

| Variable          | Required | Description                                                   |
| :---------------- | :------- | :------------------------------------------------------------ |
| `PORT`            | Yes      | HTTP listening port (Default: `4000`)                         |
| `DATABASE_URL`    | Yes      | PostgreSQL connection string                                  |
| `JWT_SECRET`      | Yes      | Secret key for signing JWT tokens                             |
| `JWT_EXPIRY`      | No       | Token expiration window (Default: `7d`)                       |
| `OLLAMA_BASE_URL` | Yes      | Ollama service endpoint (`http://host.docker.internal:11434`) |
| `OLLAMA_MODEL`    | No       | Target LLM model name (Default: `llama3`)                     |

---

## Running Locally

```bash
# Start NestJS API in watch mode
pnpm --filter @finai/api dev

# Build production bundle
pnpm --filter @finai/api build

# Run API unit tests
pnpm --filter @finai/api test
```
