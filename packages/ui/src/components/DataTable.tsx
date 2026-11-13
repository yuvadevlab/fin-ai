import React from "react";
import { cn } from "../lib/utils";
import { Pagination, PaginationProps } from "./Pagination";

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[];
  columns: Column<T>[];
  rowKey: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  pagination?: PaginationProps;
  /**
   * When true, the table fills all available height in its container.
   * thead stays sticky at the top, tbody scrolls, and Pagination docks
   * as a fixed footer at the bottom of the table card.
   *
   * Use this inside <TablePageContainer> for ledger/list pages.
   */
  fillViewport?: boolean;
  /** Optional custom class name applied to the <table> element */
  tableClassName?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  pagination,
  fillViewport = false,
  tableClassName,
  className,
  ...props
}: DataTableProps<T>) {
  const tableContent = (
    <table className={cn("finai-table", tableClassName)}>
      <thead className={cn("finai-table-thead", fillViewport && "finai-table-thead--sticky")}>
        <tr>
          {columns.map((col, index) => (
            <th key={index} scope="col" className={cn("finai-table-th", col.className)}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="finai-table-tbody">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="finai-table-empty" aria-live="polite">
              No data available
            </td>
          </tr>
        ) : (
          data.map((item) => (
            <tr
              key={rowKey(item)}
              onClick={() => onRowClick?.(item)}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              className={cn(onRowClick && "finai-table-row--interactive")}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={cn("finai-table-td", col.className)}>
                  {col.accessor(item)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div
      className={cn("finai-table-shell", fillViewport && "finai-table-shell--fill", className)}
      {...props}
    >
      <div className="finai-table-scroll-area">{tableContent}</div>
      {pagination && (
        <div className="finai-table-pagination-footer">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
