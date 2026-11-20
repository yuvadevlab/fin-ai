/**
 * @file apps/web/src/lib/constants/seo.constants.ts
 * @description Centralized metadata catalog and Schema.org JSON-LD structured data generators.
 * Adheres to technical SEO best practices, Rule 5 (isolated constants) and Rule 6 (zero hardcoded strings).
 * @module @fin-ai/web/lib/constants/seo
 */

export const SITE_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : "https://fin-ai-yuvadevlab.vercel.app"),
  AUTHOR_NAME: "Yuva DevLab",
  AUTHOR_URL:
    process.env.NEXT_PUBLIC_DEVLAB_PORTAL_URL || "https://devlab-portal-yuvadevlab.vercel.app",
  TWITTER_CREATOR: "@yuvadevlab",
  LOCALE: "en_US",
  DEFAULT_OG_IMAGE: "/opengraph-image",
} as const;

export function buildCanonicalUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.BASE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export const FINAI_METADATA = {
  TITLE: "FinAI — AI-Powered Personal Finance & Wealth Management",
  TITLE_TEMPLATE: "%s | FinAI",
  DESCRIPTION:
    "Track expenses, manage budgets, forecast wealth, achieve financial goals, and make smarter financial decisions with FinAI's intelligent AI-powered financial insights.",
  SITE_NAME: "FinAI",
  AUTHOR: SITE_CONFIG.AUTHOR_NAME,
  AUTHOR_URL: SITE_CONFIG.AUTHOR_URL,
  KEYWORDS: [
    "FinAI",
    "AI Personal Finance Tracker",
    "AI Expense Tracker",
    "Personal Finance Management",
    "AI Financial Advisor",
    "Wealth Management",
    "Budget Planning",
    "Expense Tracking",
    "Financial Goal Tracking",
    "Smart Money Management",
  ],
  OG_TITLE: "FinAI — AI-Powered Personal Finance & Wealth Management",
  OG_DESCRIPTION:
    "Intelligent financial tracking, automated budgeting, wealth forecasting, and AI financial advisor insights.",
  OG_IMAGE: "/opengraph-image",
  OG_IMAGE_ALT: "FinAI AI-Powered Personal Finance & Wealth Management Dashboard",
  LOGIN_TITLE: "Sign In — FinAI",
  LOGIN_DESCRIPTION: "Securely access your FinAI personal finance dashboard through Yuva DevLab.",
  LOGIN_OG_TITLE: "Sign In — FinAI",
  LOGIN_OG_DESCRIPTION:
    "Access your personal financial dashboard, AI advisor, and wealth tracking tools.",
} as const;

export const PUBLIC_PAGES_SEO = {
  HOME: {
    title: FINAI_METADATA.TITLE,
    description: FINAI_METADATA.DESCRIPTION,
    path: "/",
  },
  FEATURES: {
    title: "Features & Capabilities — Intelligent Personal Wealth Suite",
    description:
      "Explore FinAI's full feature set: real-time expense classification, proactive envelope budgeting, multi-year wealth forecasting, and Google Gemini AI insights.",
    path: "/features",
  },
  EXPENSE_TRACKING: {
    title: "AI Expense Tracker & Financial Ledger",
    description:
      "Automate transaction categorization, monitor daily spending habits, and detect cash flow leaks with FinAI's precision expense management engine.",
    path: "/expense-tracking",
  },
  BUDGET_PLANNING: {
    title: "Smart Budget Planner & Envelope Budgeting",
    description:
      "Create zero-based budgets, dynamic category caps, and automated threshold alerts to keep your household and personal spending on track.",
    path: "/budget-planning",
  },
  AI_FINANCIAL_ADVISOR: {
    title: "AI Financial Advisor — Conversational Wealth Intelligence",
    description:
      "Chat with your personal AI financial advisor powered by Google Gemini. Receive contextual spending advice, portfolio reviews, and actionable financial plans.",
    path: "/ai-financial-advisor",
  },
  WEALTH_MANAGEMENT: {
    title: "Wealth Management & Long-Term Financial Forecasting",
    description:
      "Forecast net worth trajectories, monitor asset allocation across banks and investments, and simulate compound growth milestones with FinAI.",
    path: "/wealth-management",
  },
  FINANCIAL_GOALS: {
    title: "Financial Goal Tracking & Automated Savings Milestones",
    description:
      "Define S.M.A.R.T. wealth goals, track emergency funds, and monitor real-time completion progress with automated milestone projections.",
    path: "/financial-goals",
  },
  ABOUT: {
    title: "About FinAI & Yuva DevLab — Engineering Principles & Vision",
    description:
      "Learn about the mission, zero-data-monetization policy, and engineering principles behind FinAI and the Yuva DevLab ecosystem.",
    path: "/about",
  },
  BLOG: {
    title: "FinAI Insights — Personal Finance, Wealth & AI Strategy",
    description:
      "Actionable guides, data-driven budgeting tactics, and expert insights on personal wealth management and AI financial technology.",
    path: "/blog",
  },
  PRIVACY_POLICY: {
    title: "Privacy Policy — Zero-Brokerage Data Protection",
    description:
      "Read our strict zero-data-selling guarantee, bank-grade encryption standards, and private workspace isolation policies.",
    path: "/privacy-policy",
  },
  TERMS_OF_SERVICE: {
    title: "Terms of Service — Product Usage & Platform Governance",
    description:
      "Review the terms governing FinAI platform usage, financial disclaimers, and user security responsibilities.",
    path: "/terms-of-service",
  },
} as const;

/** Schema.org JSON-LD Generators */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.BASE_URL}/#organization`,
    name: "Yuva DevLab",
    url: SITE_CONFIG.AUTHOR_URL,
    logo: `${SITE_CONFIG.BASE_URL}/icon.svg`,
    sameAs: ["https://github.com/yuvadevlab"],
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.BASE_URL}/#website`,
    name: FINAI_METADATA.SITE_NAME,
    url: SITE_CONFIG.BASE_URL,
    description: FINAI_METADATA.DESCRIPTION,
    publisher: { "@id": `${SITE_CONFIG.BASE_URL}/#organization` },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_CONFIG.BASE_URL}/#software`,
    name: "FinAI",
    operatingSystem: "Web Browser",
    applicationCategory: "FinanceApplication",
    author: { "@id": `${SITE_CONFIG.BASE_URL}/#organization` },
    publisher: { "@id": `${SITE_CONFIG.BASE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: FINAI_METADATA.DESCRIPTION,
    featureList: [
      "AI Expense Tracking",
      "Envelope Budget Planning",
      "Conversational AI Financial Advisor",
      "Multi-Year Wealth Forecasting",
      "Financial Goal Milestones",
      "Zero Data Selling Privacy Model",
    ],
  };
}

export function generateFaqSchema(
  faqs:
    | ReadonlyArray<{ readonly question: string; readonly answer: string }>
    | Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema(article: {
  headline: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    url: `${SITE_CONFIG.BASE_URL}/blog/${article.slug}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image
      ? `${SITE_CONFIG.BASE_URL}${article.image}`
      : `${SITE_CONFIG.BASE_URL}/opengraph-image`,
    author: { "@id": `${SITE_CONFIG.BASE_URL}/#organization` },
    publisher: { "@id": `${SITE_CONFIG.BASE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_CONFIG.BASE_URL}/#website` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.BASE_URL}/blog/${article.slug}`,
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.BASE_URL}${item.path}`,
    })),
  };
}
