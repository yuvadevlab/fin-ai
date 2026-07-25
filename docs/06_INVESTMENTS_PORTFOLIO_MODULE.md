# 06 — Investments Portfolio Module Specification

This document covers the **Investments Page (`/investments`)**, asset class categorization, unrealized profit & loss calculations, and portfolio allocation pie charts.

---

## 1. Product Requirements & Overview

The Investments module allows users to track their entire wealth portfolio across 9 supported asset classes:

1. `MUTUAL_FUND`
2. `STOCK`
3. `FIXED_DEPOSIT`
4. `GOLD`
5. `EPF`
6. `PPF`
7. `REAL_ESTATE`
8. `CRYPTO`
9. `OTHER`

---

## 2. Component Structure

```text
src/features/investments/components/
├── InvestmentsPage.tsx         # Main portfolio layout
├── CategoryPie.tsx             # Recharts asset allocation distribution pie
├── InvestmentDialog.tsx        # Modal wrapper (2-file feature pattern)
└── InvestmentForm.tsx          # Holding entry fields (name, asset class, current value, invested amount)
```

---

## 3. Mathematical Calculations (`@finai/finance-engine`)

- **`calculateUnrealizedPL(currentValue: number, investedAmount: number)`**:
  - `unrealizedPL = currentValue - investedAmount`
  - `returnsPercentage = ((currentValue - investedAmount) / investedAmount) * 100`

- **`calculateAssetAllocation(investments: Investment[])`**:
  - Aggregates portfolio value by `assetClass` and returns percentage share per asset.

---

## 4. API & AI Integration

- **Fetch Route**: `GET /workspaces/:id/investments`
- **Create Route**: `POST /workspaces/:id/investments`
- **AI Insight**: `GET /ai/insight?workspaceId=:id&page=investments`
  - Evaluates asset diversification and suggests risk adjustment tips.
