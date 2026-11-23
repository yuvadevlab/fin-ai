/**
 * @file apps/web/src/features/marketing/data/features-core.data.ts
 * @description Data catalog for FinAI core ledger and intelligence features.
 * Part of features-registry deconstruction (Rule 4: < 250 lines).
 * @module @fin-ai/web/features/marketing/data/features-core
 */

import { APP_ROUTES } from "@/lib/routes";
import type { FeatureDoc } from "./features-registry.types";

export const CORE_FEATURES: readonly FeatureDoc[] = [
  {
    slug: "expense-tracking",
    badge: "Expense Tracking Engine",
    title: "Real-Time Ledger & Automated Categorization",
    description:
      "Gain effortless control over daily cash outflow with precision transaction logging, merchant normalization, and multi-account ledger auditing.",
    seoKey: "EXPENSE_TRACKING",
    capabilities: [
      {
        title: "Intelligent Auto-Classification",
        description:
          "Stop manually labeling transactions. FinAI analyzes raw counterparty strings and merchant metadata to classify purchases into intuitive spending groups with high precision.",
        benefits: [
          "Over 98% automated category accuracy",
          "Custom recurring rule overrides",
          "Splits across personal and shared ledgers",
          "Eliminates receipt-logging fatigue",
        ],
      },
      {
        title: "Cash Flow Velocity & Anomaly Detection",
        description:
          "Identify spending spikes before they deplete reserves. Background monitors compare current spending velocity against your 30-day historical moving average.",
        benefits: [
          "Early warning on accelerated burn rate",
          "Duplicate transaction alerts",
          "Subscription renewal tracking",
          "Outlier expenditure warnings",
        ],
      },
      {
        title: "Multi-Account Aggregation",
        description:
          "Consolidate bank checking, savings, credit cards, and digital wallets into a unified, reconciled transaction registry.",
        benefits: [
          "Comprehensive balance reconciliation",
          "Search and filter across multiple accounts",
          "Custom tag and project attribution",
          "Exportable CSV and financial telemetry",
        ],
      },
    ],
    relatedLinks: [
      {
        title: "Smart Budget Planning",
        href: APP_ROUTES.BUDGET_PLANNING,
        description: "Connect categorized expenses directly into dynamic envelope budgets.",
      },
      {
        title: "AI Financial Advisor",
        href: APP_ROUTES.AI_FINANCIAL_ADVISOR,
        description: "Get real-time answers and spending optimizations from Google Gemini.",
      },
      {
        title: "Wealth Forecasting",
        href: APP_ROUTES.WEALTH_MANAGEMENT,
        description:
          "See how your daily spending discipline translates into long-term compounding.",
      },
    ],
  },
  {
    slug: "budget-planning",
    badge: "Envelope Budgeting Engine",
    title: "Adaptive Budget Planning & Variance Buffers",
    description:
      "Design zero-based household budgets that survive real-world surprises with dynamic envelope limits, category rollover rules, and early-warning threshold alerts.",
    seoKey: "BUDGET_PLANNING",
    capabilities: [
      {
        title: "Zero-Based Digital Envelopes",
        description:
          "Give every dollar a distinct assignment before the month begins. Virtual envelopes visually display remaining spending capacity across essentials and discretionary categories.",
        benefits: [
          "Real-time visual percentage progress bars",
          "Configurable rollover surpluses for savings",
          "Emergency cushion buffers",
          "Zero guilt on pre-allocated leisure budgets",
        ],
      },
      {
        title: "Proactive Threshold Warnings",
        description:
          "Never wonder if you have enough money left for weekend plans. FinAI sends alerts at 75% and 90% category capacity so you can adjust behavior early.",
        benefits: [
          "In-app push and email notifications",
          "Adaptive pace forecasting",
          "Over-budget category rebalancing",
          "Eliminates end-of-month financial panic",
        ],
      },
      {
        title: "Financial Health Scorecard",
        description:
          "Evaluate your systemic financial posture using FinAI's proprietary Health Scoring model based on savings rate, debt ratio, and budget variance.",
        benefits: [
          "Objective 0-100 score rating",
          "Categorized health metrics (Savings, Debt, Cash Flow)",
          "Step-by-step scoring improvement suggestions",
          "Historical resilience trend charts",
        ],
      },
    ],
    relatedLinks: [
      {
        title: "Real-Time Expense Tracking",
        href: APP_ROUTES.EXPENSE_TRACKING,
        description: "Feed real-time transactions into your active budget envelopes.",
      },
      {
        title: "Wealth Forecasting",
        href: APP_ROUTES.WEALTH_MANAGEMENT,
        description: "See how disciplined budgeting accelerates your 5-year net worth.",
      },
      {
        title: "AI Financial Advisor",
        href: APP_ROUTES.AI_FINANCIAL_ADVISOR,
        description: "Simulate budget rebalancing with conversational guidance.",
      },
    ],
  },
  {
    slug: "ai-financial-advisor",
    badge: "Gemini AI Intelligence",
    title: "Conversational AI Financial Advisor",
    description:
      "Access 24/7 reasoned financial guidance, scenario simulations, and personalized wealth coaching backed by Google Gemini and real-time ledger context.",
    seoKey: "AI_FINANCIAL_ADVISOR",
    capabilities: [
      {
        title: "Context-Aware Financial Conversations",
        description:
          "Ask plain-English questions grounded in your actual numbers. FinAI's advisor analyzes your income, recurring obligations, and savings goals to deliver tailored answers.",
        benefits: [
          "Affordability simulations for major life purchases",
          "Actionable debt payoff acceleration strategies",
          "Emergency fund sufficiency checks",
          "Zero judgment, complete privacy",
        ],
      },
      {
        title: "Autonomous Financial Insights",
        description:
          "The AI Financial Advisor continuously synthesizes your transaction telemetry in the background to surface timely recommendations and behavioral insights.",
        benefits: [
          "Floating insight cards on active dashboard",
          "Underperforming budget warnings",
          "Seasonal cash flow preparation",
          "Personalized savings rate benchmarks",
        ],
      },
      {
        title: "Mathematical Grounding & Guardrails",
        description:
          "FinAI strictly separates factual mathematical computations from qualitative guidance, ensuring every simulation is mathematically verified before display.",
        benefits: [
          "Deterministic compound growth calculations",
          "LaTeX math formulas for transparent reasoning",
          "No speculative crypto hype or sponsored products",
          "Zero-commission fiduciary philosophy",
        ],
      },
    ],
    relatedLinks: [
      {
        title: "Multi-Year Wealth Forecasting",
        href: APP_ROUTES.WEALTH_MANAGEMENT,
        description: "Explore projected compound interest trajectories.",
      },
      {
        title: "Smart Budget Planning",
        href: APP_ROUTES.BUDGET_PLANNING,
        description: "Let your AI advisor assist in creating monthly category caps.",
      },
      {
        title: "Financial Goal Milestones",
        href: APP_ROUTES.FINANCIAL_GOALS,
        description: "Map conversational advice into tracked financial targets.",
      },
    ],
  },
] as const;
