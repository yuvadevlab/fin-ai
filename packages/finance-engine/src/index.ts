// ─── Calculations ────────────────────────────────────────────────────────────
export { calculateSavingsRate, calculateMonthlySavings } from "./calculations/savings";

export { calculateCashFlow, calculateNetCashFlow } from "./calculations/cash-flow";

export { calculateNetWorth, calculateNetWorthChange } from "./calculations/net-worth";

export {
  calculateBudgetUsage,
  calculateBudgetStatus,
  calculateBudgetRemaining,
  calculateAggregateBudget,
  type AggregateBudgetSummary,
} from "./calculations/budget";

export {
  calculateGoalProgress,
  calculateGoalProjection,
  estimateGoalCompletion,
  calculateAggregateGoals,
  type AggregateGoalsSummary,
} from "./calculations/goals";

export {
  calculatePortfolioValue,
  calculateAssetAllocation,
  calculateUnrealisedPL,
} from "./calculations/investments";

export {
  calculateFinancialHealthScore,
  calculateComponentScores,
  type ComponentScore,
  type HealthInput,
} from "./calculations/health";

// ─── Formatters ──────────────────────────────────────────────────────────────
export { formatINR, formatCurrencyShort, parseCurrencyValue } from "./formatters/currency";

export { formatPercentage, formatChange } from "./formatters/percentage";

// ─── Recommendations ────────────────────────────────────────────────────────
export { generateRecommendations, type Recommendation } from "./recommendations/engine";
