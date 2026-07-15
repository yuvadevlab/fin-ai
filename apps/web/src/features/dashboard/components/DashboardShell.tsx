"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Sidebar, TopBar } from "@finai/ui";
import { TransactionDialog } from "../../transactions/components";

import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const { activeWorkspace } = useActiveWorkspace();
  const workspaceName = activeWorkspace?.name || "FinAI Workspace";
  const avatarFallback = workspaceName.substring(0, 2).toUpperCase();

  const customLink = React.useCallback(
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

  const sidebar = React.useMemo(
    () => <Sidebar pathname={pathname} LinkComponent={customLink} />,
    [pathname, customLink],
  );

  const topbar = React.useMemo(
    () => (
      <TopBar
        workspaceName={workspaceName}
        avatarFallback={avatarFallback}
        onAddTransactionClick={() => setIsDialogOpen(true)}
        onNotificationsClick={() => console.log("Notifications click")}
      />
    ),
    [workspaceName, avatarFallback],
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
