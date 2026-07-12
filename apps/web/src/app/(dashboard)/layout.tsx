"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppShell, Sidebar, TopBar } from "@finai/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
        workspaceName="Sharma Family"
        avatarFallback="AS"
        onAddTransactionClick={() => console.log("Add transaction click")}
        onNotificationsClick={() => console.log("Notifications click")}
      />
    ),
    [],
  );

  return (
    <AppShell sidebar={sidebar} topbar={topbar}>
      {children}
    </AppShell>
  );
}
