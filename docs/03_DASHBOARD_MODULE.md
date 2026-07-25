# 03 — Dashboard Module Specification

This document details the product requirements, component layout, mathematical formulas, and API integrations for the **Dashboard Page (`/dashboard`)**.

---

## 1. Product Requirements & Page Overview

The Dashboard is the central home screen of FinAI. It gives users an immediate snapshot of their total net worth, net cash flow, monthly savings rate, financial health score, and an automated AI executive summary.

---

## 2. Page Architecture & Component Tree

```text
src/features/dashboard/components/
├── DashboardPage.tsx               # Main page layout container
├── KPIGrid.tsx                     # 4-card metric grid
├── CashFlowChart.tsx               # Income vs Expense trend chart
├── LiveAIInsightCard.tsx           # Streaming AI summary card (page="dashboard")
└── RecentTransactionsWidget.tsx    # 5 recent transaction entries list
```

---

## 3. Key Metrics & Mathematical Formulas (`@finai/finance-engine`)

### 3.1 Financial Health Score

- **Formula**:
  $$\text{Health Score} = 0.30 \times \text{SavingsScore} + 0.30 \times \text{LiquidityScore} + 0.20 \times \text{BudgetScore} + 0.20 \times \text{DiversificationScore}$$
- **Interpretation**:
  - `80–100`: Excellent (Green Badge)
  - `60–79`: Good (Yellow Badge)
  - `<60`: Needs Attention (Red Badge)

### 3.2 Net Cash Flow

- **Formula**: `\text{Income} - \text{Expenses}`

### 3.3 Savings Rate %

- **Formula**: `\frac{\text{Income} - \text{Expenses}}{\text{Income}} \times 100`

---

## 4. API Integration & Data Fetching

- **Hook**: `useDashboardStats(workspaceId)`
- **API Endpoint**: `GET /workspaces/:id/dashboard/stats`
- **Response Shape**:

  ```ts
  export interface DashboardStats {
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netCashFlow: number;
    savingsRate: number;
    healthScore: number;
    accountCount: number;
    budgetCount: number;
  }
  ```

- **AI Insight Endpoint**: `GET /ai/insight?workspaceId=:id&page=dashboard`
  - Streams 2-3 sentences analyzing overall net worth and cash flow velocity.
