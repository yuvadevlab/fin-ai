/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { PUBLIC_PAGES_SEO, FINAI_METADATA, buildCanonicalUrl } from "@/lib/constants/seo.constants";

export const metadata: Metadata = {
  title: PUBLIC_PAGES_SEO.PRIVACY_POLICY.title,
  description: PUBLIC_PAGES_SEO.PRIVACY_POLICY.description,
  alternates: {
    canonical: buildCanonicalUrl(PUBLIC_PAGES_SEO.PRIVACY_POLICY.path),
  },
  openGraph: {
    title: PUBLIC_PAGES_SEO.PRIVACY_POLICY.title,
    description: PUBLIC_PAGES_SEO.PRIVACY_POLICY.description,
    url: buildCanonicalUrl(PUBLIC_PAGES_SEO.PRIVACY_POLICY.path),
    siteName: FINAI_METADATA.SITE_NAME,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="fn-mkt-container fn-mkt-article-wrap">
      <header className="fn-mkt-article-header">
        <span className="fn-mkt-badge">Legal & Security</span>
        <h1 className="fn-mkt-article-title">FinAI Privacy Policy</h1>
        <p className="fn-mkt-article-desc">
          Last updated: November 20, 2026. Effective immediately across all FinAI services.
        </p>
      </header>

      <div className="fn-mkt-legal-body">
        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">1. The Zero Data Monetization Pledge</h2>
          <p className="fn-mkt-legal-p">
            FinAI and Yuva DevLab operate on a strict zero-data-monetization policy. We do not sell,
            rent, lease, or trade your personal financial records, transaction histories, or account
            balances to third-party data brokers, marketers, or credit agencies.
          </p>
        </section>

        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">2. Information We Collect</h2>
          <p className="fn-mkt-legal-p">
            We collect only the information necessary to provide the FinAI application experience:
          </p>
          <ul className="fn-mkt-legal-list">
            <li>Account credentials authenticated via Yuva DevLab Portal (name, email).</li>
            <li>Financial transactions, categories, budgets, and goals you record or import.</li>
            <li>
              Workspace configuration and application preference settings (theme, privacy mode).
            </li>
          </ul>
        </section>

        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">3. How AI Models Process Your Data</h2>
          <p className="fn-mkt-legal-p">
            When you interact with the AI Financial Advisor or receive automated transaction
            insights, your prompt queries are processed transiently with strict privacy boundaries.
            Your private financial data is never used to train public foundational AI models.
          </p>
        </section>

        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">4. Data Encryption and Storage</h2>
          <p className="fn-mkt-legal-p">
            All database records are encrypted at rest using AES-256 and in transit using TLS 1.3.
            Application authentication is cryptographically validated using RS256 JWT signatures.
          </p>
        </section>

        <section className="fn-mkt-legal-section">
          <h2 className="fn-mkt-legal-h2">5. Data Deletion and Portability</h2>
          <p className="fn-mkt-legal-p">
            You retain absolute ownership of your financial records. You may export your
            transactions at any time in standard CSV format, or permanently delete your workspace
            and associated data directly from the Settings panel.
          </p>
        </section>
      </div>
    </div>
  );
}
