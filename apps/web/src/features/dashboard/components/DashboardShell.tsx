"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Sidebar, TopBar } from "@finai/ui";
import { TransactionDialog } from "../../transactions/components";
import { SearchDropdown } from "../../search/components/SearchDropdown";
import { AppearanceSync, useAuth } from "@/providers";
import { FEATURE_FLAGS } from "@/lib/app-constants";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationsMenu } from "@/components/NotificationsMenu";
import { useIsClient } from "@/hooks";

function CustomLinkComponent({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // useIsClient returns false on the server and true on the client (see hooks/useIsClient.ts).
  // This ensures both server and initial client renders agree on the "Personal Vault"
  // fallback, preventing a hydration mismatch when user is loaded from localStorage.
  const isClient = useIsClient();

  const sidebar = useMemo(() => {
    const userName = isClient && user?.name ? `${user.name}'s FinAI` : "Personal Vault";
    return (
      <Sidebar
        pathname={pathname}
        LinkComponent={CustomLinkComponent}
        planName={userName}
        planDetails="Personal Edition · 100% Synced"
        planSyncPercentage={100}
      />
    );
  }, [pathname, user, isClient]);

  const topbar = useMemo(
    () => (
      <TopBar
        notificationsMenu={FEATURE_FLAGS.NOTIFICATIONS ? <NotificationsMenu /> : null}
        profileMenu={<ProfileMenu />}
        onAddTransactionClick={() => setIsDialogOpen(true)}
        onSearchChange={FEATURE_FLAGS.SEARCH ? (val) => setSearchQuery(val) : undefined}
      />
    ),
    [],
  );

  return (
    <>
      <AppearanceSync />
      <AppShell sidebar={sidebar} topbar={topbar}>
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
