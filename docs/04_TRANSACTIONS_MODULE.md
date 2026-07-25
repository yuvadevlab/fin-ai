# 04 — Transactions Ledger Module Specification

This document details the product requirements, component architecture, table pagination, filter popovers, and mutation dialogs for the **Transactions Ledger Page (`/transactions`)**.

---

## 1. Product Requirements & Overview

The Transactions page is the primary accounting ledger in FinAI. It supports searching notes/categories/accounts, filtering by date range cycle, transaction type, category, account, amount bounds, server-side pagination, and adding/deleting transactions.

---

## 2. Component Architecture

```text
src/features/transactions/components/
├── TransactionsPage.tsx              # Main page container & filter state manager
├── TransactionColumns.tsx            # Column definitions for DataTable
├── TransactionFiltersPopover.tsx     # Multi-field popover filter menu
├── TransactionDialog.tsx             # Modal wrapper (2-file feature pattern)
└── TransactionForm.tsx               # Pure presentation form fields
```

---

## 3. Data Table & Pagination System

The transaction ledger uses the `@finai/ui` `DataTable` component embedded with the custom `Pagination` component.

```tsx
<DataTable
  data={transactionsList}
  columns={columns}
  rowKey={(t) => t.id}
  pagination={{
    currentPage: response.page,
    totalPages: response.totalPages,
    pageSize: response.limit || pageSize,
    totalItems: response.total,
    onPageChange: (newPage) => setPage(newPage),
    onPageSizeChange: (newPageSize) => {
      setPageSize(newPageSize);
      setPage(1);
    },
  }}
/>
```

### Pagination Features

- **Prev / Next**: Navigation buttons with disabled states on boundary pages (`currentPage <= 1` / `currentPage >= totalPages`).
- **Per Page Selector**: Select dropdown allowing users to change page size (`5`, `10`, `20`, `50`).
- **"n of n" Status**: Displays `Page X of Y` and `Showing A–B of C items`.

---

## 4. API Routes & Schemas

- **Fetch Route**: `GET /workspaces/:id/transactions?page=1&pageSize=20&search=...&type=EXPENSE&category=...`
- **Create Route**: `POST /workspaces/:id/transactions`
- **Delete Route**: `DELETE /workspaces/:id/transactions/:id`
- **Zod Schema (`@finai/validation`)**: `createTransactionSchema`
  ```ts
  export const createTransactionSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    categoryId: z.string().min(1, "Category is required"),
    accountId: z.string().min(1, "Account is required"),
    toAccountId: z.string().optional(),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]),
    notes: z.string().max(255).optional(),
  });
  ```
