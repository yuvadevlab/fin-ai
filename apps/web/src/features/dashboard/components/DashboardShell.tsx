"use client";

import React, { useCallback, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Sidebar, TopBar } from "@finai/ui";
import { TransactionDialog } from "../../transactions/components";
import { WorkspaceMenu, NotificationsMenu, ProfileMenu } from "../../workspace/components";
import { SearchDropdown } from "../../search/components/SearchDropdown";
import { useWorkspace, AppearanceSync } from "@/providers";
import { useMenuItems } from "../api/getMenuItems";
import { FEATURE_FLAGS } from "@/lib/app-constants";
import { useActiveWorkspace } from "@/hooks";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { workspaceId } = useWorkspace();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: menuItems } = useMenuItems();

  const customLink = useCallback(
    ({
      href,
      children,
      className,
    }: {
      href: string;
      children: React.ReactNode;
      className?: string;
    }) => (
      <Link href={href} className={className}>
        {children}
      </Link>
    ),
    [],
  );

  const { activeWorkspace } = useActiveWorkspace();

  const sidebar = useMemo(() => {
    const memberCount = activeWorkspace?.members?.length ?? 1;
    const planText = activeWorkspace?.type === "FAMILY" ? "Family Plan" : "Personal Workspace";
    const detailsText = `${memberCount} member${memberCount > 1 ? "s" : ""} · 100% synced`;

    return (
      <Sidebar
        pathname={pathname}
        LinkComponent={customLink}
        menuItems={menuItems}
        planName={activeWorkspace?.name || planText}
        planDetails={detailsText}
        planSyncPercentage={100}
      />
    );
  }, [pathname, customLink, menuItems, activeWorkspace]);

  const topbar = useMemo(
    () => (
      <TopBar
        workspaceMenu={<WorkspaceMenu />}
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
        {/* Search results dropdown — rendered inside the shell so it floats above content */}
        {searchQuery.trim().length >= 2 && (
          <div
            ref={searchRef}
            className="pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center px-4 md:px-8"
          >
            <div className="pointer-events-auto w-full max-w-lg">
              <SearchDropdown
                workspaceId={workspaceId}
                query={searchQuery}
                onClose={() => setSearchQuery("")}
              />
            </div>
          </div>
        )}
        {children}
      </AppShell>
      <TransactionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
