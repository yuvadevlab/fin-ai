import React from "react";
import { PublicHeader } from "@/features/marketing/components/PublicHeader";
import { PublicFooter } from "@/features/marketing/components/PublicFooter";
import { EarlyAccessProvider } from "@/features/marketing/context/EarlyAccessContext";
import { EarlyAccessModal } from "@/features/marketing/components/EarlyAccessModal";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/constants/seo.constants";
import { UI_COPY } from "@/lib/ui-copy";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <EarlyAccessProvider>
      <div className="fn-mkt-page">
        {/* WCAG 2.1 Bypass Block / Keyboard Skip Link */}
        <a href="#main-content" className="fn-sr-only fn-skip-link">
          {UI_COPY.MARKETING.NAV.SKIP_TO_CONTENT}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        <PublicHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <PublicFooter />
        <EarlyAccessModal />
      </div>
    </EarlyAccessProvider>
  );
}
