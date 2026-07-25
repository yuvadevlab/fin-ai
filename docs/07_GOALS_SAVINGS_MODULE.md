# 07 — Savings Goals Module Specification

This document details the **Savings Goals Page (`/goals`)**, personal vs family target management, completion projections, and goal contribution workflows.

---

## 1. Product Requirements & Overview

The Goals module tracks personal and shared family financial targets (e.g. `Emergency Fund`, `Home Down Payment`, `Vacation to Bali`, `Child Education`). Users can log partial contributions over time and view automated target completion projections.

---

## 2. Component Structure

```text
src/features/goals/components/
├── GoalsPage.tsx              # Grid layout displaying progress cards
├── GoalDialog.tsx             # Modal wrapper for creating/editing target goals
├── ContributeDialog.tsx       # Modal wrapper for contributing funds to a goal
└── GoalForm.tsx               # Form fields (name, target amount, deadline, GoalType)
```

---

## 3. Projections & Calculations (`@finai/finance-engine`)

- **`projectGoalCompletion(current: number, target: number, monthlyContributionRate: number)`**:
  - `remaining = target - current`
  - `monthsNeeded = ceil(remaining / monthlyContributionRate)`
  - Calculates estimated target completion date based on recent savings velocity.

---

## 4. API Routes & Schemas

- **Fetch Route**: `GET /workspaces/:id/goals`
- **Create Route**: `POST /workspaces/:id/goals`
- **Contribute Route**: `POST /workspaces/:id/goals/:id/contribute`
- **AI Insight**: `GET /ai/insight?workspaceId=:id&page=goals`
  - Analyzes whether user is on track to meet goal deadlines.
