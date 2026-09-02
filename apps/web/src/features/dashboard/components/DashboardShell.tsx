"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Sidebar, TopBar, Sheet, SheetContent, SheetTitle } from "@finai/ui";
import { TransactionDialog } from "@/features/transactions/components";
import { SearchDropdown } from "@/features/search/components/SearchDropdown";
import { AppearanceSync } from "@/providers";
import { FEATURE_FLAGS } from "@/lib/app-constants";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationsMenu } from "@/components/NotificationsMenu";
import { PrivacyToggle } from "@/components/PrivacyToggle";
import { useSidebarState } from "@/hooks";

function CustomLinkComponent({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const { isCollapsed, toggleCollapse } = useSidebarState();

  // Close mobile drawer on route transition during render
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  const sidebar = useMemo(
    () => (
      <Sidebar
        pathname={pathname}
        LinkComponent={CustomLinkComponent}
        collapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
    ),
    [pathname, isCollapsed, toggleCollapse],
  );

  const topbar = useMemo(
    () => (
      <TopBar
        actions={<PrivacyToggle />}
        onMenuClick={() => setIsMobileMenuOpen(true)}
        onToggleSidebar={toggleCollapse}
        isSidebarCollapsed={isCollapsed}
        notificationsMenu={FEATURE_FLAGS.NOTIFICATIONS ? <NotificationsMenu /> : null}
        profileMenu={<ProfileMenu />}
        onAddTransactionClick={() => setIsDialogOpen(true)}
        onSearchChange={FEATURE_FLAGS.SEARCH ? (val) => setSearchQuery(val) : undefined}
      />
    ),
    [isCollapsed, toggleCollapse],
  );

  return (
    <>
      <AppearanceSync />
      <AppShell sidebar={sidebar} topbar={topbar}>
        {/* Mobile Navigation Drawer */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="border-border/80 w-72 border-r p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar
              pathname={pathname}
              LinkComponent={CustomLinkComponent}
              isMobile
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
        {/* Search results dropdown — floats above content */}
        {searchQuery.trim().length >= 2 && (
          <div
            ref={searchRef}
            className="pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center px-4 md:px-8"
          >
            <div className="pointer-events-auto w-full max-w-lg">
              <SearchDropdown query={searchQuery} onClose={() => setSearchQuery("")} />
            </div>
          </div>
        )}
        {children}
      </AppShell>
      <TransactionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
