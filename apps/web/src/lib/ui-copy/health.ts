export const HEALTH_COPY = {
  PAGE_DESCRIPTION_LONG:
    "Understand what is working, what is limiting you, and the next move that improves your financial life.",
  GUIDE_A11Y: "Learn how your financial health score is calculated",
  SCORE_TOOLTIP: "How this score works",
  ANALYZING: "Analyzing your financial foundations...",
  NEXT_ACTION: "Next best action",
  DEFAULT_ACTION: "Add a few transactions to receive a personalized action.",
  PRIORITY_AREA: (label: string): string => `Priority area: ${label}`,
  WHAT_IS_HELPING: "What is helping",
  PAGE_TITLE: "Your financial foundations",
  PAGE_DESCRIPTION: "Each metric has a target and a practical next step.",
  GUIDE_TITLE: "How your financial health score works",
  GUIDE_DESCRIPTION:
    "Your score is a guide to your financial resilience, not a judgement. We compare your habits with practical targets and point to the next improvement.",
  WHAT_COUNTS: "What counts:",
  IMPROVE_IT: "Improve it:",
  CALCULATION_NOTE: "Calculation note:",
  GUIDE_FOOTER:
    "A very low emergency fund, high debt pressure, or negative monthly cash flow can limit the overall score even when another metric is strong. This keeps serious risks visible.",
  NOW: "Now:",
  TARGET: "Target:",
} as const;
