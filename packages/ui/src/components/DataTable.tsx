import React from "react";
import { cn } from "../lib/utils";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[];
  columns: Column<T>[];
  rowKey: (item: T) => string | number;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  className,
  ...props
}: DataTableProps<T>) {
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
    </div>
  );
}
