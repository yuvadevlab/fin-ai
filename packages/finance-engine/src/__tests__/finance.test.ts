import { describe, it, expect } from "vitest";
import { HEALTH_METRIC_KEYS } from "@finai/shared-types";
import {
  calculateSavingsRate,
  calculateMonthlySavings,
  calculateNetWorth,
  calculateNetWorthChange,
  calculateBudgetUsage,
  calculateBudgetStatus,
  calculateBudgetRemaining,
  calculatePortfolioValue,
  calculateAssetAllocation,
  calculateUnrealisedPL,
  calculateFinancialHealthScore,
  calculateCashFlow,
  formatINR,
  formatCurrencyShort,
  formatPercentage,
} from "../index";

describe("Finance Engine Calculations (Unit Tests)", () => {
  describe("Savings Calculations", () => {
    it("should calculate savings rate correctly", () => {
      const rate = calculateSavingsRate(100000, 60000);

      expect(rate).toBe(40);
    });

    it("should return 0 savings rate when income is 0 or negative", () => {
      expect(calculateSavingsRate(0, 5000)).toBe(0);
      expect(calculateSavingsRate(-1000, 5000)).toBe(0);
    });

    it("should calculate monthly savings amount", () => {
      expect(calculateMonthlySavings(50000, 35000)).toBe(15000);

      expect(calculateMonthlySavings(30000, 45000)).toBe(0);
    });
  });

  describe("Cash Flow Calculations", () => {
    it("should compute income, expense, and investment streams", () => {
      const now = new Date();
      const thisMonthIso = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();
      const points = calculateCashFlow(
        [
          { amount: 116831, date: thisMonthIso, type: "INCOME" as never },
          { amount: 35304, date: thisMonthIso, type: "EXPENSE" as never },
          { amount: 25000, date: thisMonthIso, type: "INVESTMENT" as never },
        ],
        1,
      );

      expect(points).toHaveLength(1);
      expect(points[0].income).toBe(116831);
      expect(points[0].expense).toBe(35304);
      expect(points[0].investment).toBe(25000);
    });
  });

  describe("Net Worth Calculations", () => {
    it("should calculate net worth correctly", () => {
      const netWorth = calculateNetWorth([50000, 150000, 200000], [30000, 70000]);

      expect(netWorth).toBe(500000);
    });

    it("should handle empty asset or liability arrays", () => {
      expect(calculateNetWorth([], [])).toBe(0);
      expect(calculateNetWorth([50000], [])).toBe(50000);

      expect(calculateNetWorth([], [20000])).toBe(20000);
    });

    it("should calculate net worth change and percentage", () => {
      const change = calculateNetWorthChange(120000, 100000);

      expect(change.absolute).toBe(20000);
      expect(change.percentage).toBe(20);
    });
  });

  describe("Budget Calculations", () => {
    it("should calculate budget usage percentage", () => {
      expect(calculateBudgetUsage(8000, 10000)).toBe(80);
      expect(calculateBudgetUsage(12000, 10000)).toBe(120);
    });

    it("should handle zero or negative budget limits", () => {
      expect(calculateBudgetUsage(5000, 0)).toBe(0);
      expect(calculateBudgetUsage(5000, -1000)).toBe(0);
    });

    it("should calculate remaining budget", () => {
      // 10,000 limit - 6,500 spent = 3,500 remaining
      expect(calculateBudgetRemaining(6500, 10000)).toBe(3500);

      // 5,000 limit - 6,000 spent = -1,000 (over budget)
      expect(calculateBudgetRemaining(6000, 5000)).toBe(-1000);
    });

    it("should return correct budget status thresholds", () => {
      expect(calculateBudgetStatus(5000, 10000)).toBe("ON_TRACK"); // 50%
      expect(calculateBudgetStatus(8500, 10000)).toBe("ON_TRACK"); // exactly 85%
      expect(calculateBudgetStatus(8600, 10000)).toBe("NEAR_LIMIT"); // >85%
      expect(calculateBudgetStatus(9500, 10000)).toBe("NEAR_LIMIT"); // 95%
      expect(calculateBudgetStatus(10000, 10000)).toBe("AT_LIMIT"); // 100% (limit reached)
      expect(calculateBudgetStatus(10500, 10000)).toBe("OVER"); // >100%
    });
  });

  describe("Portfolio & Investments", () => {
    it("should calculate total portfolio value", () => {
      const value = calculatePortfolioValue([
        { currentValue: 100000 },
        { currentValue: 250000 },
        { currentValue: 50000 },
      ]);

      expect(value).toBe(400000);
    });

    it("should calculate asset allocation percentages", () => {
      const allocation = calculateAssetAllocation([
        { name: "STOCK", currentValue: 300000 },
        { name: "MUTUAL_FUND", currentValue: 100000 },
      ]);

      expect(allocation).toEqual([
        {
          name: "STOCK",
          currentValue: 300000,
          value: 300000,
          allocation: 75,
        },
        {
          name: "MUTUAL_FUND",
          currentValue: 100000,
          value: 100000,
          allocation: 25,
        },
      ]);
    });

    it("should calculate unrealised P&L and percentage return", () => {
      const pl = calculateUnrealisedPL(125000, 100000);

      expect(pl.absolute).toBe(25000);
      expect(pl.percentage).toBe(25);
    });
  });

  describe("Financial Health Score", () => {
    it("should compute a health score clamped between 0 and 100", () => {
      const result = calculateFinancialHealthScore({
        monthlyIncome: 100000,
        monthlyExpenses: 50000,
        budgetAdherence: 0.8,
        debtToIncomeRatio: 0.2,
        emergencyFundMonths: 2,
        savingsRate: 60,
        investmentDiversification: 80,
        goalProgress: 50,
      });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.rating).toBeDefined();
      expect(
        result.metrics.some((metric) => metric.key === HEALTH_METRIC_KEYS.EMERGENCY_RUNWAY),
      ).toBe(true);
      expect(result.nextBestAction).toBeDefined();
    });
  });

  describe("Formatters", () => {
    it("should format currency with INR symbol", () => {
      const formatted = formatINR(50000);

      expect(formatted).toContain("₹");
      expect(formatted).toContain("50,000");
    });

    it("should format compact currency accurately without crude rounding", () => {
      expect(formatCurrencyShort(119651)).toBe("₹1.2L");
      expect(formatCurrencyShort(118600)).toBe("₹1.19L");
      expect(formatCurrencyShort(118000)).toBe("₹1.18L");
      expect(formatCurrencyShort(116831)).toBe("₹1.17L");
      expect(formatCurrencyShort(120000)).toBe("₹1.2L");
      expect(formatCurrencyShort(100000)).toBe("₹1L");
      expect(formatCurrencyShort(63205)).toBe("₹63.21k");
      expect(formatCurrencyShort(78248.88)).toBe("₹78.25k");
      expect(formatCurrencyShort(35303.66)).toBe("₹35.3k");
      expect(formatCurrencyShort(17825)).toBe("₹17.83k");
      expect(formatCurrencyShort(1000)).toBe("₹1k");
      expect(formatCurrencyShort(10000000)).toBe("₹1Cr");
      expect(formatCurrencyShort(11800000)).toBe("₹1.18Cr");
      expect(formatCurrencyShort(450)).toBe("₹450");
    });

    it("should format percentages accurately", () => {
      expect(formatPercentage(24.567)).toBe("24.6%");
      expect(formatPercentage(50, 0)).toBe("50%");
    });
  });
});
