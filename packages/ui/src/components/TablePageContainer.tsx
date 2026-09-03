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
      className={cn(
        "animate-in fade-in flex min-h-full flex-col duration-300 md:h-full md:min-h-0",
        className,
      )}
      style={{
        paddingInline: "var(--page-padding-x)",
      }}
    >
      {/* Header section — pinned on desktop, natural scroll on mobile */}
      <div
        className="shrink-0 space-y-3 sm:space-y-4"
        style={{ paddingTop: "var(--page-padding-y)" }}
      >
        {header}
      </div>

      {/* Table container — fills remaining height on desktop, natural height on mobile */}
      <div
        className="flex flex-1 flex-col md:min-h-0"
        style={{ paddingBottom: "var(--page-padding-y)", paddingTop: "1rem" }}
      >
        {children}
      </div>
    </div>
  );
}
