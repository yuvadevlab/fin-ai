# @finai/shared-types

`@finai/shared-types` houses all shared TypeScript types, interfaces, enums, data contracts, and API payload definitions used across `@finai/api`, `@finai/web`, `@finai/finance-engine`, and `@finai/validation`.

---

## Key Enums & Types

### 1. Account Types

```ts
export enum AccountType {
  BANK = "BANK",
  CREDIT_CARD = "CREDIT_CARD",
  WALLET = "WALLET",
  CASH = "CASH",
}
```

### 2. Transaction Types

```ts
export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}
```

### 3. Budget Status

```ts
export type BudgetStatus = "ON_TRACK" | "NEAR_LIMIT" | "OVER";
```

### 4. Health Metric Data Structure

```ts
export interface HealthMetric {
  label: string;
  score: number;
  note: string;
}
```

---

## Build Commands

```bash
# Build TypeScript declarations (.d.ts) and ESM/CJS bundles using tsup
pnpm --filter @finai/shared-types build
```
