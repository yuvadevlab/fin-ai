# FinAI — Deep Product & Technical Specification Dossier

## 1. Product Overview & Vision

### 1.1 The Operational Problem Space

Traditional personal finance applications (Mint, YNAB, Monarch) suffer from critical limitations:

- **Passive Dashboards**: They display backward-looking charts of historical spending but fail to offer proactive, strategic recommendations.
- **Privacy Compromise**: Cloud-hosted AI advisors send sensitive financial records (bank accounts, balances, net worth) to third-party proprietary LLM APIs, risking privacy leaks.
- **Disconnected Financial Calculations**: AI advisors frequently hallucinate financial figures when performing mathematical projections directly in language model attention heads.

### 1.2 The FinAI Solution

FinAI is an **Autonomous AI Financial Intelligence Platform**:

1. **Privacy-Preserving Local & Cloud Intelligence**: Powered by Ollama local models and DevLab secure AI endpoints, ensuring financial data never leaks to public training corpuses.
2. **Decoupled Pure Financial Math**: All calculations (net worth, cash flow, runway, Sharpe ratio, goal trajectories) are evaluated in `@finai/finance-engine`—a pure, deterministic library with zero side-effects and zero LLM hallucination risk.
3. **Conversational ReAct Cognitive Advisory**: An autonomous financial advisor that retrieves exact ledger facts before synthesizing personalized advice.
4. **2-Phase Mutating Safeguards**: Prevents accidental financial modifications by requiring human confirmation preview cards for all writes.

---

## 2. Technical Stack & Architectural Rationale

### 2.1 Language & Framework Breakdown

| Layer              | Technology                       | Why Selected Over Alternatives                                                                                                           |
| :----------------- | :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Web**   | **Next.js 15 (React 19)**        | Server-side rendering for fast initial load, TanStack React Query for aggressive client cache invalidation, and Lucide icons.            |
| **Backend API**    | **NestJS 11**                    | Enterprise TypeScript framework offering robust Dependency Injection (DI), modular domain separation, and standardized validation pipes. |
| **Database & ORM** | **PostgreSQL + Prisma 7.8**      | Relational ACID guarantees are mandatory for double-entry financial ledgers and balance updates.                                         |
| **Math Engine**    | **`@finai/finance-engine`**      | 100% pure functional TypeScript. Zero I/O, zero network, zero dependencies. Guarantees deterministic arithmetic.                         |
| **UI Components**  | **`@yuva-devlab/ui` + Tailwind** | Unified design system tokens, accessible Radix dialogs, and seamless dark mode.                                                          |

---

## 3. Structural & Architectural Design

```
finai/
├── apps/
│   ├── web/                    # Next.js 15 dashboard & conversational UI
│   │   ├── src/features/       # Domain-driven features (accounts, transactions, goals)
│   │   └── src/components/     # UI presentation components
│   └── api/                    # NestJS backend application
│       └── src/modules/        # Account, Transaction, Budget, and Agent modules
├── packages/
│   ├── finance-engine/         # Pure, zero-IO mathematical modeling engine
│   ├── ai-engine/              # ReAct loop, DevLab chat adapter, tool manifests
│   ├── validation/             # Canonical Zod schemas for all financial entities
│   ├── shared-types/           # Shared TypeScript interfaces and enums
│   └── database/               # Prisma client, migrations, and seed scripts
├── .agents/                    # Specialized AI agent roles & rules
└── turbo.json                  # Turborepo task pipeline configuration
```

---

## 4. Financial Security & Reliability Guarantees

1. **Deterministic Arithmetic**: Never allows an LLM to add, multiply, or project account balances directly; the AI passes arguments to `@finai/finance-engine` functions.
2. **ACID Transaction Boundaries**: Multi-account transfers execute within Prisma `$transaction` blocks to ensure money is never debited without a corresponding credit.
3. **Safe Storage**: API keys, access tokens, and sensitive credentials are encrypted using AES-256 before persistence.
