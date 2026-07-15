"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Sidebar, TopBar } from "@finai/ui";
import { TransactionDialog } from "../../transactions/components";

export function DashboardShell({
  workspaceName,
  avatarFallback,
  children,
}: {
  workspaceName: string;
  avatarFallback: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
