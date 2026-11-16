/**
 * @file apps/web/src/app/robots.ts
 * @description Dynamic robots.txt configuration for FinAI.
 * @module @finai/web/app
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fin-ai-yuvadevlab.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register", "/forgot-password"],
      disallow: ["/api/", "/transactions/", "/accounts/", "/budgets/", "/goals/", "/settings/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
