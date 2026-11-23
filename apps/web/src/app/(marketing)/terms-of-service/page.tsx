/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { PUBLIC_PAGES_SEO, FINAI_METADATA, buildCanonicalUrl } from "@/lib/constants/seo.constants";

export const metadata: Metadata = {
  title: PUBLIC_PAGES_SEO.TERMS_OF_SERVICE.title,
  description: PUBLIC_PAGES_SEO.TERMS_OF_SERVICE.description,
  alternates: {
    canonical: buildCanonicalUrl(PUBLIC_PAGES_SEO.TERMS_OF_SERVICE.path),
  },
  openGraph: {
    title: PUBLIC_PAGES_SEO.TERMS_OF_SERVICE.title,
    description: PUBLIC_PAGES_SEO.TERMS_OF_SERVICE.description,
    url: buildCanonicalUrl(PUBLIC_PAGES_SEO.TERMS_OF_SERVICE.path),
    siteName: FINAI_METADATA.SITE_NAME,
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="fn-mkt-container fn-mkt-article-wrap">
      <header className="fn-mkt-article-header">
        <span className="fn-mkt-badge">Platform Governance</span>
        <h1 className="fn-mkt-article-title">FinAI Terms of Service</h1>
        <p className="fn-mkt-article-desc">
          Last updated: November 20, 2026. Please read these terms carefully before using FinAI.
        </p>
      </header>

      <div className="fn-mkt-legal-body">
        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">1. Educational and Planning Disclaimer</h2>
          <p className="fn-mkt-legal-p">
            FinAI is designed solely as an educational, informational, and personal budgeting tool.
            FinAI, Yuva DevLab, and its underlying AI models do not provide registered fiduciary,
            investment, tax, legal, or accounting advice. All scenario calculations, compound
            projections, and advisor insights are mathematical simulations based on user input.
          </p>
        </section>

        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">2. User Account and Security</h2>
          <p className="fn-mkt-legal-p">
            Access to FinAI requires an authenticated account through the Yuva DevLab Portal. You
            are responsible for safeguarding your login credentials and ensuring that authorized
            persons only access your private financial workspaces.
          </p>
        </section>

        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">3. Acceptable Use Policy</h2>
          <p className="fn-mkt-legal-p">
            You agree not to use FinAI for any unlawful purposes, money laundering schemes,
            fraudulent credit manipulation, or malicious reverse-engineering of the platform APIs.
          </p>
        </section>

        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">4. Limitation of Liability</h2>
          <p className="fn-mkt-legal-p">
            To the maximum extent permitted by applicable law, Yuva DevLab and FinAI shall not be
            liable for any direct, indirect, incidental, or consequential damages resulting from
            financial decisions made on the basis of platform simulations, AI suggestions, or data
            interruptions.
          </p>
        </section>

        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">5. Governing Law and Attribution</h2>
          <p className="fn-mkt-legal-p">
            These terms are governed by applicable laws without regard to conflict-of-law
            principles. Direct all legal inquiries to Yuva DevLab at yuva.devlab@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
}
