/**
 * @file apps/web/src/lib/ui-copy/marketing.ts
 * @description Centralized UI copy catalog for FinAI public marketing pages.
 * Adheres to Rule 6 (Zero hardcoded user-facing strings).
 * @module @fin-ai/web/lib/ui-copy/marketing
 */

export const MARKETING_COPY = {
  NAV: {
    HOME: "Home",
    FEATURES: "Features",
    EXPENSE_TRACKING: "Expense Tracking",
    BUDGETS: "Budget Planning",
    ADVISOR: "AI Advisor",
    WEALTH: "Wealth & Goals",
    BLOG: "Blog",
    ABOUT: "About",
    SIGN_IN: "Sign In",
    GET_STARTED: "Request Early Access",
    DASHBOARD_CTA: "Open Dashboard",
    ARIA_NAV: "Main public navigation",
    ARIA_MOBILE_MENU: "Toggle mobile navigation",
    SKIP_TO_CONTENT: "Skip to main content",
    THEME_LABEL: "Appearance",
  },
  HERO: {
    BADGE: "Autonomous Financial Intelligence",
    HEADLINE_PRE: "Master Your Money with",
    HEADLINE_ACCENT: "Agentic AI Intelligence",
    SUBTITLE:
      "Automate expense classification, build adaptive budgets, simulate multi-year wealth growth, and consult an always-on AI financial co-pilot powered by Google Gemini.",
    CTA_PRIMARY: "Request Early Access",
    CTA_SECONDARY: "Explore Capabilities",
    TRUST_PILLS: ["Zero Data Selling", "AES-256 Workspace Encryption", "Real-Time AI Insights"],
  },
  PREVIEW: {
    BADGE: "Unified Financial Workspace",
    TITLE: "Your Complete Financial Life on One Clean Canvas",
    SUBTITLE:
      "A high-precision command center engineered for total visibility across income, expenses, budgets, and investments.",
    METRICS: [
      { label: "Active Cash Flow", value: "Real-Time Tracking" },
      { label: "AI Advisor Status", value: "Autonomous & Ready" },
      { label: "Data Monetization", value: "0% Brokerage / Zero Sale" },
    ],
  },
  PILLARS: {
    SECTION_BADGE: "Core Pillars",
    TITLE: "Built for Precision, Designed for Peace of Mind",
    SUBTITLE:
      "Every tool you need to eliminate financial anxiety and build long-term wealth, all working in harmony.",
    ITEMS: [
      {
        id: "expense-tracking",
        title: "Intelligent Expense Tracking",
        description:
          "Automatic categorization, merchant normalization, and real-time cash flow anomaly detection across all accounts.",
        href: "/expense-tracking",
      },
      {
        id: "budget-planning",
        title: "Adaptive Envelope Budgeting",
        description:
          "Proactive category caps, rollover buffers, and dynamic threshold alerts before overspending occurs.",
        href: "/budget-planning",
      },
      {
        id: "ai-financial-advisor",
        title: "AI Financial Advisor",
        description:
          "Context-aware financial planning powered by Google Gemini. Ask complex questions, simulate trade-offs, and receive reasoned advice.",
        href: "/ai-financial-advisor",
      },
      {
        id: "wealth-management",
        title: "Multi-Year Wealth Forecasting",
        description:
          "Trajectory modeling, compound asset projections, and debt amortization schedules to chart your path to financial independence.",
        href: "/wealth-management",
      },
      {
        id: "financial-goals",
        title: "Milestone Goal Tracking",
        description:
          "S.M.A.R.T. goal allocations, emergency fund tracking, and automated savings targets with real-time completion telemetry.",
        href: "/financial-goals",
      },
      {
        id: "privacy-first",
        title: "Private Workspaces",
        description:
          "Shared household workspaces with granular privacy masking toggles to protect personal transactions.",
        href: "/about",
      },
    ],
    EXPLORE_ACTION: "Explore capability",
  },
  HOW_IT_WORKS: {
    BADGE: "Workflow",
    TITLE: "From Scattered Numbers to Strategic Wealth",
    SUBTITLE: "Three deliberate steps to full financial clarity.",
    STEPS: [
      {
        number: "01",
        title: "Record or Connect",
        description:
          "Log your accounts, track income and recurring expenses, or organize household transactions in dedicated workspaces.",
      },
      {
        number: "02",
        title: "AI Analyzes & Synthesizes",
        description:
          "Gemini-powered background models detect spending velocity, benchmark budget variance, and evaluate financial health.",
      },
      {
        number: "03",
        title: "Act with Confidence",
        description:
          "Consult your AI advisor on major purchases, adjust category caps, and watch your compounding forecast update live.",
      },
    ],
  },
  SECURITY: {
    BADGE: "Data Dignity",
    TITLE: "Your Financial Data Belongs to You. Period.",
    SUBTITLE:
      "FinAI operates on a strict zero-data-monetization policy. We never sell your transactions or serve predatory loan ads.",
    POINTS: [
      {
        title: "Zero Third-Party Data Brokers",
        desc: "We will never sell, lease, or aggregate your transaction history to advertising networks or credit bureaus.",
      },
      {
        title: "Cryptographic SSO Protection",
        desc: "Authentication is managed centrally through Yuva DevLab Portal using RS256 JWT signatures and isolated sessions.",
      },
      {
        title: "Granular Privacy Mode",
        desc: "One-click privacy toggle masks dollar balances on screen so you can use FinAI in public or shared spaces safely.",
      },
    ],
  },
  FAQ: {
    BADGE: "Frequently Asked Questions",
    TITLE: "Everything You Need to Know About FinAI",
    ITEMS: [
      {
        question: "How does FinAI use artificial intelligence?",
        answer:
          "FinAI integrates Google Gemini to provide conversational financial guidance, categorize transactions, detect anomalous spending spikes, and simulate multi-year compound interest scenarios based on your specific numbers.",
      },
      {
        question: "Is FinAI free to use?",
        answer:
          "Yes. FinAI is currently provided as a core product within the Yuva DevLab developer and creator ecosystem with full feature access.",
      },
      {
        question: "Does FinAI sell my financial data?",
        answer:
          "No. Never. FinAI and Yuva DevLab operate on strict zero-brokerage privacy standards. Your financial records are strictly isolated in your workspace and never monetized or exposed to ad brokers.",
      },
      {
        question: "How do I sign in or create an account?",
        answer:
          "FinAI utilizes centralized authentication through the Yuva DevLab Portal. Clicking 'Sign In' or 'Get Started' securely signs you in through your central DevLab credentials without requiring a separate password.",
      },
      {
        question: "Can I manage family or shared household expenses?",
        answer:
          "Yes. FinAI supports multiple workspaces. You can maintain a private personal workspace alongside shared household workspaces with built-in privacy masking.",
      },
    ],
  },
  CTA_BANNER: {
    TITLE: "Ready to Take Complete Control of Your Financial Future?",
    SUBTITLE:
      "Join thoughtful individuals building long-term wealth with agentic financial intelligence. Secure your private beta invitation today.",
    PRIMARY_BTN: "Request Early Access",
    SECONDARY_BTN: "Sign In to Portal",
  },
  BLOG: {
    BADGE: "Educational Resources",
    TITLE: "FinAI Insights & Financial Strategy",
    SUBTITLE:
      "In-depth guides, quantitative budgeting systems, and strategic wealth-building tactics engineered by the Yuva DevLab team.",
    READ_MORE: "Read article",
    BACK_TO_ARTICLES: "Back to Articles",
    TAKEAWAYS_TITLE: "Key Strategic Takeaways",
    RELATED_TITLE: "Recommended Insights",
    RELATED_SUBTITLE: "Continue building financial mastery with these practical frameworks.",
  },
  FEATURE_PAGES: {
    PRIMARY_CTA: "Request Early Access",
    SECONDARY_CTA: "All Features",
    RELATED_TITLE: "Explore Related Capabilities",
    RELATED_SUBTITLE: "FinAI's modular architecture connects every aspect of your financial life.",
    LEARN_MORE: "Learn more",
    STEP_PREFIX: "0",
  },
  FOOTER: {
    BRAND_TAGLINE:
      "FinAI is an intelligent personal finance and wealth management platform engineered by Yuva DevLab.",
    SECTIONS: {
      PRODUCT: {
        TITLE: "Product",
        LINKS: [
          { label: "Features", href: "/features" },
          { label: "Expense Tracking", href: "/expense-tracking" },
          { label: "Budget Planning", href: "/budget-planning" },
          { label: "AI Advisor", href: "/ai-financial-advisor" },
          { label: "Wealth Forecasting", href: "/wealth-management" },
          { label: "Financial Goals", href: "/financial-goals" },
        ],
      },
      RESOURCES: {
        TITLE: "Resources",
        LINKS: [
          { label: "Blog & Guides", href: "/blog" },
          { label: "About Yuva DevLab", href: "/about" },
        ],
      },
      LEGAL: {
        TITLE: "Legal & Trust",
        LINKS: [
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms of Service", href: "/terms-of-service" },
        ],
      },
    },
    COPYRIGHT: `© ${new Date().getFullYear()} Yuva DevLab. All rights reserved.`,
    DISCLAIMER:
      "FinAI is designed for educational and personal financial planning purposes only and does not constitute registered fiduciary investment or legal tax advice.",
  },
} as const;
