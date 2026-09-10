import { formatINR } from "../formatters/currency";

export interface Recommendation {
  /** Stable display id ("rec-1", "rec-2", …), assigned in generation order. */
  id: string;
  category: "budget" | "savings" | "investment" | "goal" | "general";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  /** Estimated money the user could recover, when quantifiable. */
  potentialSavings?: number;
}

/** Describes the user's financial state used to generate recommendations. */
interface RecommendationInput {
  savingsRate: number;
  budgetCategories: {
    name: string;
    spent: number;
    limit: number;
  }[];
  emergencyFundMonths: number;
  investmentAllocation: { name: string; allocation: number }[];
  goals: { name: string; current: number; target: number; deadline: string }[];
}

/**
 * Rule-based "smart tips" generator: converts the user's financial snapshot
 * into prioritised, human-readable nudges. This is deterministic template
 * logic — NOT the LLM advisor — so it works offline and costs nothing; the
 * rules encode common personal-finance heuristics:
 *   - over-spent budget  → high priority, with the overage as potential savings
 *   - >85% of a budget used → medium early warning (mirrors BudgetStatus thresholds)
 *   - savings rate < 20%  → high nudge; > 50% → praise + invest suggestion
 *   - emergency fund < 3 months → high nudge; ≥ 6 months → invest surplus
 *   - goal deadline < 6 months away → monthly amount needed to hit it
 *
 * @returns Recommendations sorted high → medium → low (stable within a
 *   priority, preserving generation order). Empty when everything is healthy.
 */
export function generateRecommendations(input: RecommendationInput): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let id = 1;

  // Budget over-spend recommendations
  for (const cat of input.budgetCategories) {
    if (cat.spent > cat.limit) {
      const over = cat.spent - cat.limit;
      recommendations.push({
        id: `rec-${id++}`,
        category: "budget",
        priority: "high",
        title: `${cat.name} over budget`,
        description: `You've exceeded your ${cat.name} budget by ${formatINR(over)}. Consider reducing spending in this category.`,
        potentialSavings: over,
      });
    } else if (cat.spent > cat.limit * 0.85) {
      recommendations.push({
        id: `rec-${id++}`,
        category: "budget",
        priority: "medium",
        title: `${cat.name} nearing limit`,
        description: `You've used ${Math.round((cat.spent / cat.limit) * 100)}% of your ${cat.name} budget. Consider slowing down spending.`,
      });
    }
  }

  // Savings rate recommendations
  if (input.savingsRate < 20) {
    recommendations.push({
      id: `rec-${id++}`,
      category: "savings",
      priority: "high",
      title: "Low savings rate",
      description: `Your savings rate is ${input.savingsRate.toFixed(1)}%. Aim for at least 20% to build long-term wealth.`,
    });
  } else if (input.savingsRate > 50) {
    recommendations.push({
      id: `rec-${id++}`,
      category: "savings",
      priority: "low",
      title: "Excellent savings rate",
      description: `Your savings rate of ${input.savingsRate.toFixed(1)}% is outstanding. Consider increasing equity allocation for higher growth.`,
    });
  }

  // Emergency fund recommendations
  if (input.emergencyFundMonths < 3) {
    recommendations.push({
      id: `rec-${id++}`,
      category: "general",
      priority: "high",
      title: "Build emergency fund",
      description: `You have ${input.emergencyFundMonths.toFixed(1)} months of expenses covered. Aim for at least 6 months.`,
    });
  } else if (input.emergencyFundMonths >= 6) {
    recommendations.push({
      id: `rec-${id++}`,
      category: "investment",
      priority: "low",
      title: "Redirect excess emergency funds",
      description: `Your emergency fund covers ${input.emergencyFundMonths.toFixed(1)} months. Consider investing surplus in equity for higher returns.`,
    });
  }

  // Goal at-risk recommendations
  for (const goal of input.goals) {
    const remaining = goal.target - goal.current;
    const deadlineDate = new Date(goal.deadline);
    // Months left, floored at 1 so an already-passed deadline produces a
    // large (urgently actionable) required-monthly figure instead of a
    // division by ~0 or a negative. 30-day months are fine at this precision.
    const monthsLeft = Math.max(
      1,
      (deadlineDate.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000),
    );
    const requiredMonthly = remaining / monthsLeft;

    if (remaining > 0 && monthsLeft < 6) {
      recommendations.push({
        id: `rec-${id++}`,
        category: "goal",
        priority: "medium",
        title: `${goal.name} deadline approaching`,
        description: `You need ${formatINR(requiredMonthly)}/month to reach your ${goal.name} goal by the deadline.`,
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
