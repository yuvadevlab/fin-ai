import { describe, it, expect } from "vitest";
import { calculateSavingsRate, calculateMonthlySavings } from "../calculations/savings";
import {
  calculateBudgetUsage,
  calculateBudgetStatus,
  calculateBudgetRemaining,
} from "../calculations/budget";
import { calculateGoalProgress, calculateGoalProjection } from "../calculations/goals";
import { calculatePortfolioValue, calculateUnrealisedPL } from "../calculations/investments";
import { calculateNetWorth } from "../calculations/net-worth";
import { formatINR, formatCurrencyShort } from "../formatters/currency";
import { formatChange } from "../formatters/percentage";

describe("savings", () => {
  it("calculates savings rate", () => {
    expect(calculateSavingsRate(125000, 48200)).toBe(61.4);
  });

  it("returns 0 for zero income", () => {
    expect(calculateSavingsRate(0, 5000)).toBe(0);
  });

  it("calculates monthly savings", () => {
    expect(calculateMonthlySavings(125000, 48200)).toBe(76800);
  });

  it("returns 0 when expenses exceed income", () => {
    expect(calculateMonthlySavings(10000, 15000)).toBe(0);
  });
});

describe("budget", () => {
  it("calculates budget usage", () => {
    expect(calculateBudgetUsage(8400, 10000)).toBe(84);
  });

  it("returns ON_TRACK for under 85%", () => {
    expect(calculateBudgetStatus(8000, 10000)).toBe("ON_TRACK");
  });

  it("returns NEAR_LIMIT for 85-100%", () => {
    expect(calculateBudgetStatus(9000, 10000)).toBe("NEAR_LIMIT");
  });

  it("returns OVER for above 100%", () => {
    expect(calculateBudgetStatus(6800, 6000)).toBe("OVER");
  });

  it("calculates remaining budget", () => {
    expect(calculateBudgetRemaining(8400, 10000)).toBe(1600);
    expect(calculateBudgetRemaining(6800, 6000)).toBe(-800);
  });
});

describe("goals", () => {
  it("calculates goal progress", () => {
    expect(calculateGoalProgress(380000, 500000)).toBe(76);
  });

  it("caps progress at 100", () => {
    expect(calculateGoalProgress(600000, 500000)).toBe(100);
  });

  it("projects months to completion", () => {
    expect(calculateGoalProjection(380000, 500000, 20000)).toBe(6);
  });

  it("returns null for zero contribution", () => {
    expect(calculateGoalProjection(380000, 500000, 0)).toBeNull();
  });

  it("returns 0 when already complete", () => {
    expect(calculateGoalProjection(500000, 500000, 20000)).toBe(0);
  });
});

describe("investments", () => {
  it("calculates portfolio value", () => {
    const investments = [
      { currentValue: 425000 },
      { currentValue: 285000 },
      { currentValue: 180000 },
    ];
    expect(calculatePortfolioValue(investments)).toBe(890000);
  });

  it("calculates unrealised P/L", () => {
    const { absolute, percentage } = calculateUnrealisedPL(425000, 378000);
    expect(absolute).toBe(47000);
    expect(percentage).toBeGreaterThan(0);
  });
});

describe("net-worth", () => {
  it("sums accounts and investments", () => {
    const result = calculateNetWorth([214500, 342800, -18240], [425000, 285000]);
    expect(result).toBe(1249060);
  });
});

describe("formatters", () => {
  it("formats INR with Indian grouping", () => {
    expect(formatINR(125000)).toBe("₹1,25,000");
    expect(formatINR(-840)).toBe("-₹840");
  });

  it("formats short currency", () => {
    expect(formatCurrencyShort(125000)).toBe("₹1.3L");
    expect(formatCurrencyShort(48200)).toBe("₹48k");
  });

  it("formats change with sign", () => {
    expect(formatChange(12.4)).toBe("+12.4%");
    expect(formatChange(-3.1)).toBe("-3.1%");
  });
});
