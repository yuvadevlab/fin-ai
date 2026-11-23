"use client";

/**
 * @file apps/web/src/features/marketing/components/PublicHeader.tsx
 * @description Accessible public navigation header with active page indicators, decoupled theme switcher, and waitlist modal trigger.
 * @module @fin-ai/web/features/marketing/components/PublicHeader
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, FinAILogo, Sheet, SheetContent, SheetTitle, cn } from "@fin-ai/ui";
import { Menu, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/providers/auth";
import { DEVLAB_PORTAL_ROUTES, APP_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";
import { useEarlyAccess } from "../context/EarlyAccessContext";

export function PublicHeader(): React.JSX.Element {
  const { token } = useAuth();
  const { openModal } = useEarlyAccess();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const copy = UI_COPY.MARKETING.NAV;

  const portalLoginUrl = DEVLAB_PORTAL_ROUTES.LOGIN();

  const navItems = [
    { label: copy.FEATURES, href: APP_ROUTES.FEATURES },
    { label: copy.EXPENSE_TRACKING, href: APP_ROUTES.EXPENSE_TRACKING },
    { label: copy.BUDGETS, href: APP_ROUTES.BUDGET_PLANNING },
    { label: copy.ADVISOR, href: APP_ROUTES.AI_FINANCIAL_ADVISOR },
    { label: copy.WEALTH, href: APP_ROUTES.WEALTH_MANAGEMENT },
    { label: copy.BLOG, href: APP_ROUTES.BLOG },
  ];

  return (
    <header className="fn-mkt-header" role="banner">
      <div className="fn-mkt-container fn-mkt-header-inner">
        {/* Left Side: Mobile Menu Button + Brand Logo */}
        <div className="fn-mkt-header-left">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="fn-mkt-mobile-menu-btn"
            aria-label={copy.ARIA_MOBILE_MENU}
            aria-expanded={mobileOpen}
          >
            <Menu className="fn-icon-md" aria-hidden="true" />
          </Button>

          <Link href={APP_ROUTES.HOME} className="fn-sidebar-brand-link" aria-label="FinAI Home">
            <FinAILogo compact showName />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="fn-mkt-nav-links" aria-label={copy.ARIA_NAV}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || Boolean(pathname?.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("fn-mkt-nav-link", isActive && "fn-mkt-nav-link--active")}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div className="fn-mkt-header-actions">
          <ThemeToggle />

          {token ? (
            <Button size="sm" asChild>
              <Link href={APP_ROUTES.DASHBOARD}>
                {copy.DASHBOARD_CTA}
                <ArrowRight className="fn-mkt-btn-arrow" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="fn-mkt-sign-in-btn">
                <a href={portalLoginUrl}>{copy.SIGN_IN}</a>
              </Button>
              <Button size="sm" onClick={openModal}>
                {copy.GET_STARTED}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer (Opens from LEFT, matching app sidebar convention) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="fn-mkt-drawer" aria-label={copy.ARIA_MOBILE_MENU}>
          <SheetTitle className="fn-sr-only">{copy.ARIA_MOBILE_MENU}</SheetTitle>
          <div className="fn-mkt-drawer-inner">
            {/* Header: Brand only - clean breathing room without overlapping close X */}
            <div className="fn-mkt-drawer-header">
              <Link
                href={APP_ROUTES.HOME}
                onClick={() => setMobileOpen(false)}
                className="fn-sidebar-brand-link"
                aria-label="FinAI Home"
              >
                <FinAILogo compact showName />
              </Link>
            </div>

            <nav className="fn-mkt-drawer-nav" aria-label={copy.ARIA_NAV}>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || Boolean(pathname?.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn("fn-mkt-drawer-link", isActive && "fn-mkt-drawer-link--active")}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <ArrowRight
                      className="fn-icon-xs fn-mkt-drawer-link-arrow"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="fn-mkt-drawer-footer">
              {/* Theme switcher cleanly anchored in mobile utilities footer */}
              <div className="fn-mkt-drawer-utilities">
                <span className="fn-mkt-drawer-theme-label">{copy.THEME_LABEL}</span>
                <ThemeToggle />
              </div>

              {token ? (
                <Button asChild onClick={() => setMobileOpen(false)}>
                  <Link href={APP_ROUTES.DASHBOARD}>{copy.DASHBOARD_CTA}</Link>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      openModal();
                    }}
                  >
                    {copy.GET_STARTED}
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
