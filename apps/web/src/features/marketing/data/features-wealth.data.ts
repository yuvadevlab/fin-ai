/**
 * @file apps/web/src/features/marketing/data/features-wealth.data.ts
 * @description Data catalog for FinAI wealth forecasting and goal tracking features.
 * Part of features-registry deconstruction (Rule 4: < 250 lines).
 * @module @fin-ai/web/features/marketing/data/features-wealth
 */

import { APP_ROUTES } from "@/lib/routes";
import type { FeatureDoc } from "./features-registry.types";

export const WEALTH_FEATURES: readonly FeatureDoc[] = [
  {
    slug: "wealth-management",
    badge: "Wealth Forecasting",
    title: "Net Worth Trajectory & Long-Term Compounding",
    description:
      "Visualize multi-year wealth accumulation, track asset allocation across liquid and illiquid accounts, and model debt payoff horizons with precision.",
    seoKey: "WEALTH_MANAGEMENT",
    capabilities: [
      {
        title: "Multi-Year Trajectory Modeling",
        description:
          "Simulate how modest increases in monthly savings compound over 5, 10, and 20 years with dynamic return rate sensitivity analyses.",
        benefits: [
          "Interactive compound interest forecasting",
          "Inflation-adjusted real return calculations",
          "Retirement target date projections",
          "Visual milestone timeline charts",
        ],
      },
      {
        title: "Comprehensive Asset Allocation",
        description:
          "Monitor your net worth balance sheet across liquid cash, investment portfolios, real estate, and liabilities in a unified dashboard.",
        benefits: [
          "Liquid vs. illiquid net worth breakdown",
          "Liability amortization schedules",
          "Diversification ratio indicators",
          "Debt-to-asset health tracking",
        ],
      },
      {
        title: "Investment Portfolio Analytics",
        description:
          "Track historical dividend yields, cost basis, and portfolio valuation growth with clear visualization cards and exportable telemetry.",
        benefits: [
          "Real-time asset rebalancing insights",
          "Sector and asset class breakdown charts",
          "Cost basis and unrealized gain summaries",
          "Zero trading fees or broker kickbacks",
        ],
      },
    ],
    relatedLinks: [
      {
        title: "Financial Goal Milestones",
        href: APP_ROUTES.FINANCIAL_GOALS,
        description: "Align your wealth projections with tangible life milestones.",
      },
      {
        title: "AI Financial Advisor",
        href: APP_ROUTES.AI_FINANCIAL_ADVISOR,
        description: "Simulate early mortgage payoff vs. index fund investing.",
      },
      {
        title: "Expense Management",
        href: APP_ROUTES.EXPENSE_TRACKING,
        description: "Protect your long-term compounding rate by plugging lifestyle creep.",
      },
    ],
  },
  {
    slug: "financial-goals",
    badge: "Milestone Goal Tracking",
    title: "S.M.A.R.T. Goals & Automated Savings Targets",
    description:
      "Transform distant financial dreams into actionable, tracked milestones with visual completion gauges, target dates, and automated contribution projections.",
    seoKey: "FINANCIAL_GOALS",
    capabilities: [
      {
        title: "Milestone Structuring & Target Dates",
        description:
          "Define Specific, Measurable, Achievable, Relevant, and Time-bound wealth targets: emergency buffers, home down payments, tuition funds, or sabbatical savings.",
        benefits: [
          "Target date completion estimation",
          "Required monthly contribution calculations",
          "Priority sequencing (Emergency → Debt → Milestones)",
          "Visual circular completion gauges",
        ],
      },
      {
        title: "Automated Progress Telemetry",
        description:
          "Watch your goals advance automatically as transactions and account balances synchronize across your workspaces.",
        benefits: [
          "Real-time progress percentage updates",
          "Pace indicators (Ahead of Schedule / On Track / Behind)",
          "Visual milestone celebration notifications",
          "Historic contribution velocity logs",
        ],
      },
      {
        title: "Multi-Goal Allocation Strategy",
        description:
          "Distribute monthly surplus across multiple simultaneous goals with intelligent priority weighting to prevent milestone starvation.",
        benefits: [
          "Proportional monthly distribution rules",
          "Emergency reserve lock protection",
          "Dynamic goal re-prioritization",
          "Integrated with active budget envelopes",
        ],
      },
    ],
    relatedLinks: [
      {
        title: "Wealth Forecasting",
        href: APP_ROUTES.WEALTH_MANAGEMENT,
        description: "See how your goals roll up into your multi-year net worth.",
      },
      {
        title: "Envelope Budget Planning",
        href: APP_ROUTES.BUDGET_PLANNING,
        description: "Protect your goal contributions inside dedicated savings envelopes.",
      },
      {
        title: "AI Financial Advisor",
        href: APP_ROUTES.AI_FINANCIAL_ADVISOR,
        description: "Ask your AI co-pilot for strategies to reach your goals faster.",
      },
    ],
  },
] as const;
