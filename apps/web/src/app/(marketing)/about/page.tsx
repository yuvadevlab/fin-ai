/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { CtaBannerSection } from "@/features/marketing/components/CtaBannerSection";
import { PUBLIC_PAGES_SEO, FINAI_METADATA, buildCanonicalUrl } from "@/lib/constants/seo.constants";

export const metadata: Metadata = {
  title: PUBLIC_PAGES_SEO.ABOUT.title,
  description: PUBLIC_PAGES_SEO.ABOUT.description,
  alternates: {
    canonical: buildCanonicalUrl(PUBLIC_PAGES_SEO.ABOUT.path),
  },
  openGraph: {
    title: PUBLIC_PAGES_SEO.ABOUT.title,
    description: PUBLIC_PAGES_SEO.ABOUT.description,
    url: buildCanonicalUrl(PUBLIC_PAGES_SEO.ABOUT.path),
    siteName: FINAI_METADATA.SITE_NAME,
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="fn-mkt-hero">
        <div className="fn-mkt-hero-glow" aria-hidden="true" />
        <div className="fn-mkt-container fn-mkt-hero-content">
          <div className="fn-mkt-badge">About Yuva DevLab & FinAI</div>
          <h1 className="fn-mkt-hero-headline">Engineering Autonomous Wealth Dignity</h1>
          <p className="fn-mkt-hero-sub">
            FinAI was born from a fundamental belief: financial software should empower you with
            clarity, not exploit your behavioral vulnerabilities to sell high-interest debt.
          </p>
        </div>
      </section>

      <section className="fn-mkt-section fn-mkt-section-bordered">
        <div className="fn-mkt-container">
          <div className="fn-mkt-about-body">
            <div className="fn-mkt-about-section">
              <h2 className="fn-mkt-about-h2">Our Core Philosophy</h2>
              <p className="fn-mkt-about-p">
                Most consumer financial tools are disguised lead-generation engines for credit cards
                and personal loans. Their revenue increases when you carry balances and stay in
                debt. FinAI rejects this paradigm entirely. We build pure, mathematical software
                designed exclusively to help you accumulate wealth, eliminate debt, and make
                confident decisions.
              </p>
            </div>

            <div className="fn-mkt-about-section">
              <h2 className="fn-mkt-about-h2">The Yuva DevLab Ecosystem</h2>
              <p className="fn-mkt-about-p">
                FinAI is deeply integrated into the Yuva DevLab platform suite alongside DevLab
                Portal, OrchestrAI, and DevLab Guard. We leverage centralized, cryptographic Single
                Sign-On (SSO) to give you sovereign control over your authentication credentials and
                workspace access.
              </p>
            </div>

            <div className="fn-mkt-about-section">
              <h2 className="fn-mkt-about-h2">Privacy & Zero-Brokerage Pledge</h2>
              <p className="fn-mkt-about-p">
                Your financial transactions are encrypted at rest with AES-256 and strictly isolated
                within your private workspace. We do not sell user data, train public foundation
                models on your private ledgers, or partner with predatory financial brokers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBannerSection />
    </>
  );
}
