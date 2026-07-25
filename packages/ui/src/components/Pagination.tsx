import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../primitives/select";
import { cn } from "../lib/utils";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showPageSize = true,
  className,
  ...props
}: PaginationProps) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = totalPages <= 0 || currentPage >= totalPages;

  const startItem =
    totalItems !== undefined && totalItems > 0 && pageSize ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem =
    totalItems !== undefined && pageSize ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div
      className={cn(
        "border-border/60 text-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t px-6 py-3.5 text-xs",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <span className="font-medium">
          Page <span className="text-foreground font-semibold">{currentPage}</span> of{" "}
          <span className="text-foreground font-semibold">{totalPages || 1}</span>
          {totalItems !== undefined && (
            <span className="text-muted-foreground ml-1 font-normal">
              ({startItem > 0 ? `${startItem}–${endItem} of ` : ""}
              {totalItems} items)
            </span>
          )}
        </span>

        {showPageSize && onPageSizeChange && pageSize !== undefined && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Per page:</span>
            <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)} className="text-xs">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 gap-1 px-2.5 text-xs"
        >
          <ChevronLeft className="size-3.5" />
          <span>Prev</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 gap-1 px-2.5 text-xs"
        >
          <span>Next</span>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
