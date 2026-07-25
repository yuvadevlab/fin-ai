# 05 — Budgets & Expense Limits Module Specification

This document covers the **Budgets Page (`/budgets`)**, category limit allocations, progress bars, budget risk scoring, and AI optimisations.

---

## 1. Product Requirements & Overview

The Budgets module enables users to set weekly, monthly, or yearly spending caps per category (e.g., `Groceries`, `Dining Out`, `Shopping`, `Utilities`). It tracks current spending in real-time against those limits and alerts users when budgets approach or exceed limits.

---

## 2. Component Structure

```text
src/features/budgets/components/
├── BudgetsPage.tsx            # Main grid layout
├── BudgetCard.tsx             # Card showing progress bar, spent vs limit, and color status badge
├── BudgetDialog.tsx           # Modal wrapper for creating/editing budget limits
└── BudgetForm.tsx             # Budget form fields (category select, limit amount, period)
```

---

## 3. Mathematical Calculations (`@finai/finance-engine`)

- **`calculateBudgetUsage(spent: number, limit: number)`**:
  - `usagePercentage = (spent / limit) * 100`
  - `remaining = limit - spent`
  - `isExceeded = spent >= limit`

### Status Badge Color Coding

- **Normal (`<80%`)**: Green progress bar & badge.
- **Warning (`80%–99%`)**: Yellow progress bar & warning badge.
- **Exceeded (`≥100%`)**: Red progress bar & `EXCEEDED` alert badge.

---

## 4. API & AI Integration

- **Fetch Route**: `GET /workspaces/:id/budgets`
- **Create Route**: `POST /workspaces/:id/budgets`
- **Delete Route**: `DELETE /workspaces/:id/budgets/:id`
- **AI Insight**: `GET /ai/insight?workspaceId=:id&page=budgets`
  - Identifies which budget category is most at risk or exceeded and suggests exact cutbacks.
