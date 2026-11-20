"use client";

/**
 * @file apps/web/src/features/marketing/components/PublicHeader.tsx
 * @description Responsive public navigation header with theme toggle and DevLab Portal SSO actions.
 * @module @fin-ai/web/features/marketing/components/PublicHeader
 */

import React, { useState } from "react";
import Link from "next/link";
import { Button, FinAILogo, Sheet, SheetContent, SheetTitle } from "@fin-ai/ui";
import { Menu, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/providers/auth";
import { DEVLAB_PORTAL_ROUTES, APP_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";

export function PublicHeader(): React.JSX.Element {
  const { token } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const copy = UI_COPY.MARKETING.NAV;

  const portalLoginUrl = DEVLAB_PORTAL_ROUTES.LOGIN();
  const portalRegisterUrl = DEVLAB_PORTAL_ROUTES.REGISTER();

  const navItems = [
    { label: copy.FEATURES, href: APP_ROUTES.FEATURES },
    { label: copy.EXPENSE_TRACKING, href: APP_ROUTES.EXPENSE_TRACKING },
    { label: copy.BUDGETS, href: APP_ROUTES.BUDGET_PLANNING },
    { label: copy.ADVISOR, href: APP_ROUTES.AI_FINANCIAL_ADVISOR },
    { label: copy.WEALTH, href: APP_ROUTES.WEALTH_MANAGEMENT },
    { label: copy.BLOG, href: APP_ROUTES.BLOG },
  ];

  return (
    <header className="fn-mkt-header">
      <div className="fn-mkt-container fn-mkt-header-inner">
        {/* Left Side: Mobile Menu Button + Brand Logo */}
        <div className="fn-mkt-header-left">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="fn-mkt-mobile-menu-btn"
            aria-label={copy.ARIA_MOBILE_MENU}
          >
            <Menu className="fn-icon-md" />
          </Button>

          <Link href={APP_ROUTES.HOME} className="fn-sidebar-brand-link" aria-label="FinAI Home">
            <FinAILogo compact showName />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="fn-mkt-nav-links" aria-label={copy.ARIA_NAV}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="fn-mkt-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="fn-mkt-header-actions">
          <ThemeToggle />

          {token ? (
            <Button size="sm" asChild>
              <Link href={APP_ROUTES.DASHBOARD}>
                {copy.DASHBOARD_CTA}
                <ArrowRight className="fn-mkt-btn-arrow" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="fn-mkt-sign-in-btn">
                <a href={portalLoginUrl}>{copy.SIGN_IN}</a>
              </Button>
              <Button size="sm" asChild>
                <a href={portalRegisterUrl}>{copy.GET_STARTED}</a>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer (Opens from LEFT, matching app sidebar convention) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="fn-mkt-drawer">
          <SheetTitle className="fn-sr-only">{copy.ARIA_MOBILE_MENU}</SheetTitle>
          <div className="fn-mkt-drawer-inner">
            <div className="fn-mkt-drawer-header">
              <Link
                href={APP_ROUTES.HOME}
                onClick={() => setMobileOpen(false)}
                className="fn-sidebar-brand-link"
              >
                <FinAILogo compact showName />
              </Link>
              <ThemeToggle />
            </div>

            <nav className="fn-mkt-drawer-nav" aria-label={copy.ARIA_NAV}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="fn-mkt-drawer-link"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="fn-icon-xs fn-mkt-drawer-link-arrow" />
                </Link>
              ))}
            </nav>

            <div className="fn-mkt-drawer-footer">
              {token ? (
                <Button asChild onClick={() => setMobileOpen(false)}>
                  <Link href={APP_ROUTES.DASHBOARD}>{copy.DASHBOARD_CTA}</Link>
                </Button>
              ) : (
                <>
                  <Button asChild onClick={() => setMobileOpen(false)}>
                    <a href={portalRegisterUrl}>{copy.GET_STARTED}</a>
                  </Button>
                  <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                    <a href={portalLoginUrl}>{copy.SIGN_IN}</a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
