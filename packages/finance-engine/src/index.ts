// ─── Calculations ────────────────────────────────────────────────────────────
export { calculateSavingsRate, calculateMonthlySavings } from "./calculations/savings";

export { calculateCashFlow, calculateNetCashFlow } from "./calculations/cash-flow";

export { calculateNetWorth, calculateNetWorthChange } from "./calculations/net-worth";

export {
  calculateBudgetUsage,
  calculateBudgetStatus,
  calculateBudgetRemaining,
} from "./calculations/budget";

export {
  calculateGoalProgress,
  calculateGoalProjection,
  estimateGoalCompletion,
} from "./calculations/goals";

export {
  calculatePortfolioValue,
  calculateAssetAllocation,
  calculateUnrealisedPL,
} from "./calculations/investments";

export { calculateFinancialHealthScore, calculateComponentScores } from "./calculations/health";

// ─── Formatters ──────────────────────────────────────────────────────────────
export { formatINR, formatCurrencyShort, parseCurrencyValue } from "./formatters/currency";

export { formatPercentage, formatChange } from "./formatters/percentage";

// ─── Recommendations ────────────────────────────────────────────────────────
export { generateRecommendations, type Recommendation } from "./recommendations/engine";
