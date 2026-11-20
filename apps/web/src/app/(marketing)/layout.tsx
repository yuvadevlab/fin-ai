import React from "react";
import { PublicHeader } from "@/features/marketing/components/PublicHeader";
import { PublicFooter } from "@/features/marketing/components/PublicFooter";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/constants/seo.constants";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <div className="fn-mkt-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <PublicHeader />
      <main id="main-content">{children}</main>
      <PublicFooter />
    </div>
  );
}
