# 08 — Financial Reports & Analytics Module Specification

This document details the **Financial Reports Page (`/reports`)**, income vs expense comparison, category breakdown pie charts, and monthly variance reports.

---

## 1. Product Requirements & Overview

The Reports page provides historical analysis of income vs expenses, category spending distribution, and net cash flow trends over past months.

---

## 2. Component Structure

```text
src/features/reports/components/
├── ReportsPage.tsx           # Page container
├── ExpenseBarChart.tsx       # Recharts bar chart for monthly side-by-side expense trends
├── CategoryPie.tsx           # Recharts category expense pie breakdown
└── TrendLine.tsx             # Recharts line chart showing savings trajectory
```

---

## 3. API & AI Integration

- **Fetch Route**: `GET /workspaces/:id/reports/monthly`
- **AI Insight**: `GET /ai/insight?workspaceId=:id&page=reports`
  - Generates a 2-3 sentence report highlighting month-over-month income/expense variance.
