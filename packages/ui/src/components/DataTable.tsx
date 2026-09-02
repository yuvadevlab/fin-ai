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
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  pagination,
  fillViewport = false,
  className,
  ...props
}: DataTableProps<T>) {
  const tableContent = (
    <table className="w-full border-collapse text-left text-sm">
      <thead
        className={cn(
          "bg-card text-muted-foreground text-[11px] font-semibold tracking-widest uppercase",
          fillViewport && "sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-border)]",
          !fillViewport && "bg-secondary/60",
        )}
      >
        <tr>
          {columns.map((col, index) => (
            <th key={index} scope="col" className={cn("px-6 py-3", col.className)}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-border/60 divide-y">
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="text-muted-foreground px-6 py-10 text-center"
              aria-live="polite"
            >
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
              className={cn(
                "hover:bg-secondary/40 focus-visible:bg-secondary/60 transition outline-none",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={cn("px-6 py-4 font-medium", col.className)}>
                  {col.accessor(item)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  if (fillViewport) {
    return (
      <div
        className={cn(
          "bg-card ring-border/50 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl shadow-sm ring-1",
          className,
        )}
        {...props}
      >
        {/* Scrollable table body — thead is sticky inside this scroller */}
        <div className="min-h-0 flex-1 overflow-auto">{tableContent}</div>

        {/* Docked pagination footer */}
        {pagination && (
          <div className="border-border/60 bg-card shrink-0 border-t">
            <Pagination {...pagination} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card ring-border/50 overflow-hidden rounded-2xl shadow-sm ring-1",
        className,
      )}
      {...props}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-secondary/60 text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={cn("px-6 py-3", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-muted-foreground px-6 py-10 text-center"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={rowKey(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn("hover:bg-secondary/40 transition", onRowClick && "cursor-pointer")}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={cn("px-6 py-4 font-medium", col.className)}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
