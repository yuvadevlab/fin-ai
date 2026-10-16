# FinAI — Master Product Specification, Technical Dossier & Operations Manual

---

## 1. Product File: Strategic Vision & Market Requirements

### 1.1 Executive Product Summary

**FinAI** is an autonomous AI-powered personal and family wealth intelligence platform engineered to deliver proactive, private, and mathematically verifiable financial guidance.

Existing consumer financial applications (Mint, YNAB, Monarch, Copilot) are fundamentally passive: they categorize historical spending into pie charts and show historical balances, but fail to provide strategic forward-looking advisory. Conversely, generic generative AI chat wrappers suffer from dangerous "hallucinated arithmetic" (e.g. producing mathematically impossible loan amortization or retirement projections) and leak sensitive banking data to public third-party LLMs.

FinAI eliminates these failure modes through three architectural pillars:

1. **Deterministic, Zero-Hallucination Math Core**: All financial figures, net worth calculations, runway projections, and amortization schedules are computed exclusively by `@finai/finance-engine`—a pure functional TypeScript library with **zero I/O, zero network dependencies, and 100% deterministic test coverage**.
2. **Local & Private Cognitive Advisory**: Powered by Ollama on-premise models and private DevLab inference rails, ensuring sensitive banking records and balances never leak to public model training corpora.
3. **Mandatory Two-Phase Confirmation Protocol**: The AI agent is strictly restricted to read-only tools during conversation. Any state-mutating action (creating budgets, logging transactions, reallocating funds) requires an interactive 2-phase confirmation modal displaying an explicit financial impact preview before execution.

### 1.2 Target Personas & Primary Use Cases

| Persona                                  | Operational Context                                                  | Primary Pain Points Addressed                                                                                            |
| :--------------------------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **High-Earning Tech Professional**       | Managing multiple brokerage accounts, crypto wallets, and RSUs       | Inability to calculate true liquid runway, tax-efficient drawdown strategies, and automated debt payoff optimization.    |
| **Family Financial Planner**             | Coordinating multi-account household budgets and emergency savings   | Tedious manual transaction reconciliation, opaque spending leaks, and fear of unvetted AI moving money.                  |
| **Independent Freelancer / Solopreneur** | Fluctuating monthly revenue with irregular quarterly tax obligations | Inaccurate monthly budgeting due to variable income; lack of automated cash flow smoothing and tax reserve calculations. |
| **Security & Privacy-Conscious User**    | Demands institutional financial insights without cloud data sharing  | Reluctance to upload banking credentials and net worth statements to third-party closed AI clouds.                       |

### 1.3 The Problem Space: The Hallucinated Math Trap

When standard Large Language Models calculate compound interest or loan amortization directly within neural network weights, their probabilistic nature causes arithmetic hallucination. A prompt asking _"How much interest will I pay on a $450,000 mortgage at 6.5% over 30 years?"_ will frequently yield numbers that deviate by tens of thousands of dollars.

In FinAI:

- **LLMs never do math**: The LLM serves solely as an intent parser and conversational synthesizer.
- **The Engine does the math**: When the user asks a financial question, the AI advisor calls verified, deterministic tools in `@finai/finance-engine` and incorporates the exact computed outputs into its narrative response.

---

## 2. Exhaustive Feature Directory & Technical Mechanics

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       FINAI SYSTEM ARCHITECTURE                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                    [Next.js 15 Web Dashboard (:3000)]
                                     │  (React Query / REST / SSE)
                                     ▼
                    [NestJS 11 Backend API (:4000)]
                                     │  (JWT Auth, Rate Limiter, Fastify Engine)
     ┌───────────────────────────────┼───────────────────────────────┐
     ▼                               ▼                               ▼
[Deterministic Math Engine]  [ReAct Advisory Loop]        [Transactional Outbox & Ledger]
 • Pure Functional TS         • Read-Only Tool Harness     • Double-Entry Bookkeeping
 • Zero-Side-Effect Math      • Local Ollama / DevLab      • Integer Cents Representation
 • Monte Carlo Simulations    • Two-Phase Confirmation     • Audit Trail Records
     │                               │                               │
     └───────────────────────────────┴───────────────┬───────────────┘
                                                     ▼
                                      [PostgreSQL 16 & Redis 7]
```

### 2.1 Application Layer Breakdown

#### 1. Web Dashboard (`apps/web` — Port `3000`)

- **Technology Stack**: Next.js 15 (App Router), React 19, Tailwind CSS v4, React Query v5, `@finai/ui`, `@yuva-devlab/tokens`.
- **Purpose**: High-performance, responsive wealth management web application.
- **Detailed Features**:
  - **Net Worth Command Center**: Real-time aggregation of liquid assets, investments, real estate, and liabilities with historical trend charting.
  - **Cash Flow & Sankey Visualization**: Visual representation of gross income flowing into tax reserves, fixed obligations, discretionary spending, and savings buckets.
  - **Liquid Runway Radar**: Dynamically calculates how many months the household can sustain current lifestyle spending in the event of total income cessation.
  - **Two-Phase Action Confirmation Modals**: Standardized modal pattern (`<Feature>Modal.tsx` + `<Feature>Form.tsx`) displaying a side-by-side "Before vs After" impact preview prior to persisting budget modifications or manual transactions.
  - **Conversational Financial Advisory Drawer**: Floating sliding drawer providing real-time streaming advice, scenario modeling, and contextual action chips.

#### 2. Backend API Gateway (`apps/api` — Port `4000`)

- **Technology Stack**: NestJS 11, Fastify HTTP adapter, Prisma ORM, PostgreSQL 16.
- **Purpose**: Secure enterprise backend handling authentication, banking ledger management, and financial advisory orchestration.
- **Detailed Features**:
  - **Double-Entry Accounting Ledger**: Every monetary event is stored as balanced debit and credit entries. Balances are derived by summing immutable journal entries, preventing race-condition balance discrepancies.
  - **Integer Arithmetic Representation**: All currency values are stored as 64-bit integer cents (e.g. `$100.50` -> `10050`) to eliminate IEEE-754 floating-point rounding errors.
  - **Mock Banking Sync Pipeline**: High-throughput transaction ingestion service with deduplication hashing (`SHA-256(account_id + date + amount + merchant)`), idempotency checking, and automatic category classification.
  - **Advisory ReAct Controller**: Manages conversation history, token budgeting, tool invocation resolution, and streaming output generation.

---

### 2.2 Core Package Catalog

| Package                     | Purpose & Core Invariants                                                                                                                                                                                                                                                        |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@finai/finance-engine`** | **The Pure Math Core**: Pure functional TypeScript. Zero I/O, zero network, zero dependencies. Implements net worth aggregation, cash flow formulas, debt amortization tables, emergency runway calculations, Sharpe ratio calculations, and retirement Monte Carlo simulations. |
| **`@finai/ai-engine`**      | **Cognitive Advisory Harness**: Implements the ReAct (Reason + Act + Observe) advisory loop. Restricts the LLM to read-only tool calls (`get_accounts`, `get_transactions`, `get_budget_status`, `calculate_runway`).                                                            |
| **`@finai/shared-types`**   | **Canonical Financial Enums**: Houses domain enums (`AccountType`, `TransactionCategory`, `BudgetPeriod`, `AdvisoryConfidence`, `LedgerEntryType`). Zero bare string literals allowed.                                                                                           |
| **`@finai/constants`**      | **Domain Taxonomies**: Centralized currency codes (ISO 4217), category trees, default asset allocation weights, and benchmark risk-free rates.                                                                                                                                   |
| **`@finai/database`**       | **Prisma Client & Migrations**: PostgreSQL schema definitions, migration scripts, and typed repository access layers.                                                                                                                                                            |
| **`@finai/ui`**             | **Financial Component System**: Custom financial UI primitives including currency inputs, net worth trend badges, transaction rows, and balance chips.                                                                                                                           |
| **`@finai/validation`**     | **Zod Schemas**: Strict runtime validation schemas for banking payloads, user input forms, and advisory tool arguments.                                                                                                                                                          |

---

## 3. Inter-System Ecosystem Collaboration ("How It Works With Others")

```mermaid
sequenceDiagram
    autonumber
    participant Client as FinAI Web (:3000)
    participant API as FinAI API (:4000)
    participant DP as DevLab Portal (:3015)
    participant Engine as @finai/finance-engine
    participant DL as DevLab Logs (:3020)
    participant IA as IncidentAI (:8085)

    Client->>API: POST /api/v1/advisory/chat (Prompt: "Can I afford a $1,200/mo car?")
    API->>DP: 1. Verify User Tier & Feature Access (:3015)
    DP-->>API: Active Subscription (Tier: PRO)
    API->>API: 2. Fetch User Financial Snapshot from PostgreSQL
    API->>Engine: 3. Compute Runway & Cash Flow Impact (Pure Math)
    Engine-->>API: Result: Debt-to-Income jumps from 18% to 34%, Runway drops 1.8 mos
    API->>API: 4. Synthesize AI Guidance with Verified Math
    API-->>Client: Stream AI Recommendation + Action Preview Card
    API->>DL: 5. Stream Audit Log & Token Telemetry (:3020)

    alt Ingestion Failure or Math Invariant Violation
        API->>IA: 6. Dispatch Webhook Alert to IncidentAI (:8085)
        IA->>API: 7. Run Automated Sandbox Diagnosis & Alert SRE
    end
```

### 3.1 Inter-Repository Integration Matrix

| Ecosystem Member    | Direction | Protocol & Transport   | Exact Payload Contract & Endpoint                       | Purpose & Operational Behavior                                                                                      |
| :------------------ | :-------: | :--------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ |
| **`devlab-portal`** |  Inbound  | HTTP REST & Redis JWKS | `GET http://localhost:3015/api/v1/subscriptions/verify` | Validates user subscription tiers, feature flags, and API quotas before allowing advanced advisory modeling.        |
| **`devlab-logs`**   | Outbound  | HTTP/2 POST            | `POST http://localhost:3020/api/v1/logs/ingest`         | Streams structured audit logs, user advisory session events, and backend latency metrics for centralized telemetry. |
| **`incidentai`**    | Outbound  | HTTP POST Webhook      | `POST http://localhost:8085/api/v1/incidents/webhook`   | Alerts IncidentAI on unhandled banking sync exceptions, ledger imbalance errors, or advisory timeout anomalies.     |
| **`devlab-guard`**  |  Inbound  | CLI Git Pre-commit     | `uv run devlab-guard scan --path .`                     | Enforces the 250-line rule, verifies that all enums are strictly used, and guarantees zero inline regexes.          |
| **`devlab-shared`** |  Static   | npm Package Imports    | Direct package import                                   | Imports `@yuva-devlab/ui`, `@yuva-devlab/tokens`, `@yuva-devlab/resilience`, and `@yuva-devlab/logger`.             |

---

## 4. Technical Guidelines & Invariant Rules

### 4.1 Prime Non-Negotiable Invariants

1. **Deterministic Math Core Purity**:
   - Every financial calculation MUST reside in `@finai/finance-engine`.
   - The engine must NEVER make network calls, read environment variables, or access databases.
   - All monetary figures must be computed and stored as integer cents to avoid floating-point drift.
2. **Mandatory Two-Phase Confirmation**:
   - The AI advisor is NEVER permitted to execute state mutations directly.
   - Any transaction creation, budget adjustment, or account modification MUST generate an impact preview requiring explicit user approval via a confirmation modal.
3. **Hard 250-Line Maximum Rule**:
   - No code file across `apps/*` or `packages/*` may exceed 250 lines. Decompose early at 200 lines.
4. **Zero Magic Strings & Canonical Enums**:
   - All categories, account types, and ledger statuses must use canonical enums from `@finai/shared-types`.

---

## 5. Developer Usage Guidelines & Operations Manual

### 5.1 Local Prerequisites

- **Node.js**: `v22.x` or later.
- **pnpm**: `v9.x` or later.
- **PostgreSQL 16**: Running on port `5432`.
- **Redis 7**: Running on port `6379`.

### 5.2 Step-by-Step Installation & Bootstrapping

```bash
# 1. Clone the repository
git clone https://github.com/yuvadevlab/finai.git
cd finai

# 2. Install monorepo dependencies
pnpm install

# 3. Start local database & run Prisma migrations
pnpm db:generate
pnpm db:migrate

# 4. Start Web (:3000) and API (:4000) in development mode
pnpm dev

# 5. Run full typechecks
pnpm typecheck
```

### 5.3 Complete Environment Variables Reference

| Variable                 |  Type  |         Default          | Required | Description                                                                           |
| :----------------------- | :----: | :----------------------: | :------: | :------------------------------------------------------------------------------------ |
| `PORT`                   | Number |          `4000`          |   Yes    | NestJS API listening port.                                                            |
| `DATABASE_URL`           | String |            —             |   Yes    | PostgreSQL connection string (`postgresql://postgres:postgres@localhost:5432/finai`). |
| `REDIS_URL`              | String | `redis://localhost:6379` |   Yes    | Redis URL for caching and rate limiting.                                              |
| `NEXT_PUBLIC_API_URL`    | String | `http://localhost:4000`  |   Yes    | Base URL consumed by the Next.js frontend.                                            |
| `DEVLAB_PORTAL_URL`      | String | `http://localhost:3015`  |   Yes    | DevLab Portal API URL for subscription and key checks.                                |
| `DEVLAB_LOGS_URL`        | String | `http://localhost:3020`  |   Yes    | DevLab Logs ingestion endpoint.                                                       |
| `INCIDENTAI_WEBHOOK_URL` | String | `http://localhost:8085`  |    No    | Webhook URL for dispatching incident alerts.                                          |

### 5.4 Testing Financial Math in the Pure Engine

```typescript
import { calculateRunwayMonths, calculateNetWorth } from "@finai/finance-engine";

const netWorth = calculateNetWorth({
  assets: [
    { type: "CHECKING", balanceCents: 1500000 },
    { type: "INVESTMENT", balanceCents: 8500000 },
  ],
  liabilities: [{ type: "CREDIT_CARD", balanceCents: 200000 }],
});
// netWorth === 9800000 ($98,000.00)

const runway = calculateRunwayMonths({
  liquidAssetsCents: 1500000, // $15,000
  averageMonthlyBurnCents: 300000, // $3,000 / mo
});
// runway === 5.0 months
```
