import React from "react";
import { cn } from "../lib/utils";

interface TablePageContainerProps {
  /**
   * The pinned top section: PageHeader + filter toolbar.
   * Rendered above the table and never scrolls away.
   */
  header: React.ReactNode;
  /**
   * The scrollable body — typically a <DataTable fillViewport /> or
   * any content that should take all remaining height.
   */
  children: React.ReactNode;
  className?: string;
}

/**
 * TablePageContainer
 *
 * A viewport-filling flex column layout for data-ledger pages
 * (Transactions, Investments, etc.). The page header + filters are
 * pinned to the top while the table body scrolls independently.
 *
 * Usage:
 * ```tsx
 * <TablePageContainer header={<>
 *   <PageHeader title="Transactions" ... />
 *   <FilterBar ... />
 * </>}>
 *   <DataTable fillViewport data={...} columns={...} />
 * </TablePageContainer>
 * ```
 */
export function TablePageContainer({ header, children, className }: TablePageContainerProps) {
  return (
    <div
      className={cn("animate-in fade-in flex h-full min-h-0 flex-col duration-300", className)}
      style={{
        paddingInline: "var(--page-padding-x)",
      }}
    >
      {/* Pinned header section — never scrolls */}
      <div className="shrink-0 space-y-4" style={{ paddingTop: "var(--page-padding-y)" }}>
        {header}
      </div>

      {/* Flex-fill area — fills remaining height, table scrolls inside */}
      <div
        className="min-h-0 flex-1"
        style={{ paddingBottom: "var(--page-padding-y)", paddingTop: "1rem" }}
      >
        {children}
      </div>
    </div>
  );
}
