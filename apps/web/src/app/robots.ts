/**
 * @file apps/web/src/app/robots.ts
 * @description Dynamic robots.txt configuration for FinAI.
 * Allows indexation of canonical public marketing pages while protecting private financial application routes.
 * @module @fin-ai/web/app
 */

import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants/seo.constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/features",
          "/features/*",
          "/expense-tracking",
          "/budget-planning",
          "/ai-financial-advisor",
          "/wealth-management",
          "/financial-goals",
          "/about",
          "/blog",
          "/blog/*",
          "/privacy-policy",
          "/terms-of-service",
          "/icon.svg",
          "/opengraph-image",
          "/googleb6ffb6081f6f4fb1.html",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/accounts",
          "/accounts/*",
          "/transactions",
          "/transactions/*",
          "/budgets",
          "/budgets/*",
          "/goals",
          "/goals/*",
          "/investments",
          "/investments/*",
          "/health",
          "/health/*",
          "/categories",
          "/categories/*",
          "/reports",
          "/reports/*",
          "/ai-advisor",
          "/ai-advisor/*",
          "/settings",
          "/settings/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.BASE_URL}/sitemap.xml`,
  };
}
