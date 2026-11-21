/**
 * @file apps/web/src/features/marketing/components/PublicFooter.tsx
 * @description Accessible public footer with brand description, directory navigation landmarks, and Yuva DevLab attribution.
 * @module @fin-ai/web/features/marketing/components/PublicFooter
 */

import React from "react";
import Link from "next/link";
import { FinAILogo } from "@fin-ai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { APP_ROUTES } from "@/lib/routes";

export function PublicFooter(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.FOOTER;

  return (
    <footer className="fn-mkt-footer" role="contentinfo">
      <div className="fn-mkt-container">
        <div className="fn-mkt-footer-grid">
          {/* Brand Column */}
          <div className="fn-mkt-footer-brand">
            <Link href={APP_ROUTES.HOME} className="fn-sidebar-brand-link" aria-label="FinAI Home">
              <FinAILogo compact showName />
            </Link>
            <p className="fn-mkt-footer-desc">{copy.BRAND_TAGLINE}</p>
          </div>

          {/* Product Directory */}
          <nav aria-labelledby="footer-product-heading">
            <h2 id="footer-product-heading" className="fn-mkt-footer-heading">
              {copy.SECTIONS.PRODUCT.TITLE}
            </h2>
            <ul className="fn-mkt-footer-list" role="list">
              {copy.SECTIONS.PRODUCT.LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="fn-mkt-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources Directory */}
          <nav aria-labelledby="footer-resources-heading">
            <h2 id="footer-resources-heading" className="fn-mkt-footer-heading">
              {copy.SECTIONS.RESOURCES.TITLE}
            </h2>
            <ul className="fn-mkt-footer-list" role="list">
              {copy.SECTIONS.RESOURCES.LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="fn-mkt-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal Directory */}
          <nav aria-labelledby="footer-legal-heading">
            <h2 id="footer-legal-heading" className="fn-mkt-footer-heading">
              {copy.SECTIONS.LEGAL.TITLE}
            </h2>
            <ul className="fn-mkt-footer-list" role="list">
              {copy.SECTIONS.LEGAL.LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="fn-mkt-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Attribution & Legal Disclaimer */}
        <div className="fn-mkt-footer-bottom">
          <p className="fn-mkt-footer-disclaimer">{copy.DISCLAIMER}</p>
          <div>{copy.COPYRIGHT}</div>
        </div>
      </div>
    </footer>
  );
}
