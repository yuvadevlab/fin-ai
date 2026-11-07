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
    <div className={cn("finai-table-page-container", className)}>
      {/* Header section — pinned on desktop, natural scroll on mobile */}
      <div className="finai-table-page-header space-y-3 sm:space-y-4">{header}</div>

      {/* Table container — fills remaining height on desktop, natural height on mobile */}
      <div className="finai-table-page-body">{children}</div>
    </div>
  );
}
