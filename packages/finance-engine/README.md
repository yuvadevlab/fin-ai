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

The Overall Financial Health Score evaluates 5 core financial pillars. Each pillar is assigned a component score from `0` to `100`. The final Health Score is the arithmetic mean of all 5 component scores:

$$\text{Health Score} = \text{Math.round}\left( \frac{\sum \text{Component Scores}}{5} \right)$$

#### Component Score Rules

| Pillar Component      | Score Logic & Thresholds                                                                                                                             | Note Generated                                                  |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **Spending Control**  | `Adherence < 0` $\rightarrow$ `0`<br>`Adherence > 0.9` $\rightarrow$ `90`<br>`Adherence > 0.75` $\rightarrow$ `75`<br>Otherwise $\rightarrow$ `55`   | "No budgets" / "Below cap" / "Above target" / "Needs attention" |
| **Savings Rate**      | $\text{Clamp}(0, 100, \text{Round}(\text{Savings Rate} \times 2))$                                                                                   | `X% of income saved`                                            |
| **Investments**       | $\text{Clamp}(0, 100, \text{Diversification Score})$                                                                                                 | "Diversified across assets" or "No investments"                 |
| **Emergency Fund**    | `Months <= 0` $\rightarrow$ `0`<br>`Months >= 6` $\rightarrow$ `85`<br>`Months >= 3` $\rightarrow$ `65`<br>Otherwise $\rightarrow$ `35`              | "No emergency savings" or `X months covered`                    |
| **Budget Discipline** | `Adherence < 0` $\rightarrow$ `0`<br>`Adherence >= 1.0` $\rightarrow$ `90`<br>`Adherence >= 0.85` $\rightarrow$ `75`<br>Otherwise $\rightarrow$ `60` | "All within limit" or "Some over budget"                        |

#### Health Rating Classification

- **`80 – 100`**: Excellent
- **`60 – 79`**: Good
- **`40 – 59`**: Fair
- **`0 – 39`**: Needs Attention

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
