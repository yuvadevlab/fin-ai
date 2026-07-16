"use client";

import React, { useCallback, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Sidebar, TopBar } from "@finai/ui";
import { TransactionDialog } from "../../transactions/components";
import { WorkspaceMenu, NotificationsMenu, ProfileMenu } from "../../workspace/components";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const sidebar = useMemo(
    () => <Sidebar pathname={pathname} LinkComponent={customLink} />,
    [pathname, customLink],
  );

  const topbar = useMemo(
    () => (
      <TopBar
        workspaceMenu={<WorkspaceMenu />}
        notificationsMenu={<NotificationsMenu />}
        profileMenu={<ProfileMenu />}
        onAddTransactionClick={() => setIsDialogOpen(true)}
      />
    ),
    [],
  );

  return (
    <>
      <AppShell sidebar={sidebar} topbar={topbar}>
        {children}
      </AppShell>
      <TransactionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
