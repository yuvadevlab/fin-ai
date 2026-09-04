# @finai/finance-engine

`@finai/finance-engine` is a pure TypeScript package containing the core financial mathematics, calculation engines, scoring algorithms, and recommendation rules for the FinAI platform.

It operates with zero external side effects and zero I/O, ensuring deterministic, testable, and reusable financial analytics across the backend API, Next.js frontend, and offline background workers.

---

## Metric Calculation Breakdown

This section details how every financial metric in FinAI is calculated.

```
                      ┌─────────────────────────┐
                      │    Raw Database Records │
                      └────────────┬────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│  Cash Flow   │            │  Net Worth   │            │ Health Score │
│ Calculations │            │ Calculations │            │ Engine (0-100│
└──────────────┘            └──────────────┘            └──────────────┘
```

---

### 1. Financial Health Score (0–100)

**Function**: `calculateFinancialHealthScore(input: HealthInput)`
**File**: [`src/calculations/health.ts`](src/calculations/health.ts)

The financial health result is an explainable summary of six practical foundations. Each metric returns its score, current value, target, status, explanation, and next action. Missing optional data is excluded from the weighted score instead of being treated as failure.

The weighted foundations are monthly free cash (20%), savings rate (20%), emergency runway (25%), debt pressure (20%), budget control (10%), and goal progress (5%). Less than one month of emergency runway or more than 50% debt pressure caps the score at `59`; negative monthly free cash caps it at `49`.

#### Component Score Rules

| Metric                | Target           | User-facing meaning                   |
| :-------------------- | :--------------- | :------------------------------------ |
| **Monthly free cash** | 20% of income    | Money left after expenses             |
| **Savings rate**      | 20% of income    | Income being retained                 |
| **Emergency runway**  | 6 months         | Protection against unexpected costs   |
| **Debt pressure**     | 30% of income    | Whether debt is manageable            |
| **Budget control**    | 90% within limit | Whether spending follows the plan     |
| **Goal progress**     | 70% funded       | Whether planned goals are progressing |

#### Health Rating Classification

- **`80 – 100`**: Strong foundation
- **`60 – 79`**: Building stability
- **`40 – 59`**: Needs a plan
- **`0 – 39`**: Needs attention

---

### 2. Net Worth & Trend Analysis

**Functions**: `calculateNetWorth`, `calculateNetWorthChange`
**File**: [`src/calculations/net-worth.ts`](src/calculations/net-worth.ts)

- **Total Net Worth**:
  $$\text{Net Worth} = \sum (\text{Account Balances}) + \sum (\text{Investment Current Values})$$
- **Absolute Change**:
  $$\Delta_{\text{abs}} = \text{Net Worth}_{\text{current}} - \text{Net Worth}_{\text{previous}}$$
- **Percentage Change**:
  $$\Delta_{\%} = \begin{cases} 0 & \text{if } \text{Net Worth}_{\text{previous}} = 0 \\ \text{Round}\left(\frac{\Delta_{\text{abs}}}{\text{Net Worth}_{\text{previous}}} \times 100, 1\right) & \text{otherwise} \end{cases}$$

---

### 3. Monthly Cash Flow & Net Income

**Functions**: `calculateCashFlow`, `calculateNetCashFlow`
**File**: [`src/calculations/cash-flow.ts`](src/calculations/cash-flow.ts)

- **Income for Month $m$**:
  $$\text{Income}_m = \sum_{t \in \text{Transactions}_m, t.\text{type} = \text{INCOME}} |t.\text{amount}|$$
- **Expenses for Month $m$**:
  $$\text{Expense}_m = \sum_{t \in \text{Transactions}_m, t.\text{type} = \text{EXPENSE}} |t.\text{amount}|$$
- **Net Cash Flow**:
  $$\text{Net Cash Flow}_m = \text{Income}_m - \text{Expense}_m$$

---

### 4. Savings Rate & Savings Velocity

**Functions**: `calculateSavingsRate`, `calculateMonthlySavings`
**File**: [`src/calculations/savings.ts`](src/calculations/savings.ts)

- **Savings Rate Percentage**:
  $$\text{Savings Rate} = \max\left(0, \text{Round}\left(\frac{\text{Income} - \text{Expenses}}{\text{Income}} \times 100, 1\right)\right)$$
- **Monthly Savings Amount**:
  $$\text{Monthly Savings} = \max(0, \text{Income} - \text{Expenses})$$

---

### 5. Budget Tracking & Adherence Status

**Functions**: `calculateBudgetUsage`, `calculateBudgetStatus`, `calculateBudgetRemaining`
**File**: [`src/calculations/budget.ts`](src/calculations/budget.ts)

- **Budget Usage Percentage**:
  $$\text{Usage \%} = \text{Math.round}\left(\frac{\text{Spent}}{\text{Limit}} \times 100\right)$$
- **Budget Remaining**:
  $$\text{Remaining} = \text{Limit} - \text{Spent}$$
- **Status Classification**:
  - `OVER`: Usage > 100%
  - `NEAR_LIMIT`: 85% < Usage $\le$ 100%
  - `ON_TRACK`: Usage $\le$ 85%

---

### 6. Investment Portfolio & Asset Allocation

**Functions**: `calculatePortfolioValue`, `calculateAssetAllocation`, `calculateUnrealisedPL`
**File**: [`src/calculations/investments.ts`](src/calculations/investments.ts)

- **Total Portfolio Value**:
  $$\text{Portfolio Value} = \sum_{i} \text{Asset Current Value}_i$$
- **Asset Allocation %**:
  $$\text{Allocation}_i = \text{Math.round}\left(\frac{\text{Asset Current Value}_i}{\text{Portfolio Value}} \times 100\right)$$
- **Unrealised Profit / Loss (P&L)**:
  $$\text{P\&L}_{\text{abs}} = \text{Current Value} - \text{Invested Amount}$$
  $$\text{P\&L}_{\%} = \text{Round}\left(\frac{\text{P\&L}_{\text{abs}}}{\text{Invested Amount}} \times 100, 1\right)$$

---

### 7. Goal Progress & Timeline Projection

**Functions**: `calculateGoalProgress`, `calculateGoalProjection`, `estimateGoalCompletion`
**File**: [`src/calculations/goals.ts`](src/calculations/goals.ts)

- **Goal Progress %**:
  $$\text{Progress \%} = \min\left(100, \text{Math.round}\left(\frac{\text{Current Amount}}{\text{Target Amount}} \times 100\right)\right)$$
- **Months to Goal**:
  $$\text{Months Remaining} = \left\lceil \frac{\text{Target Amount} - \text{Current Amount}}{\text{Monthly Contribution}} \right\rceil$$

---

## Package API & Export Structure

```ts
import {
  calculateFinancialHealthScore,
  calculateNetWorth,
  calculateCashFlow,
  calculateSavingsRate,
  calculateBudgetStatus,
  calculateAssetAllocation,
  calculateGoalProjection,
} from "@finai/finance-engine";
```

## Running Package Unit Tests

```bash
pnpm --filter @finai/finance-engine test
```
