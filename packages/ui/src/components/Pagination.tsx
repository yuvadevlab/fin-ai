import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@yuva-devlab/ui";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

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

  const copy = UI_COPY_CONSTANTS.PAGINATION;

  return (
    <nav aria-label={copy.NAV_ARIA} className={cn("finai-pagination", className)} {...props}>
      <div className="finai-pagination-left">
        <span className="finai-pagination-info" aria-current="page">
          {copy.PAGE} <span className="finai-pagination-current">{currentPage}</span> {copy.OF}{" "}
          <span className="finai-pagination-current">{totalPages || 1}</span>
          {totalItems !== undefined && (
            <span className="finai-pagination-items-total">
              ({startItem > 0 ? `${startItem}–${endItem} ${copy.OF} ` : ""}
              {totalItems} {copy.ITEMS})
            </span>
          )}
        </span>

        {showPageSize && onPageSizeChange && pageSize !== undefined && (
          <div className="finai-pagination-size">
            <span className="finai-pagination-size-label">{copy.PER_PAGE}</span>
            <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
              <SelectTrigger
                className="finai-pagination-size-trigger"
                aria-label={copy.ROWS_PER_PAGE_ARIA}
              >
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem
                    key={option}
                    value={String(option)}
                    className="finai-pagination-size-item"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="finai-pagination-controls">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="finai-pagination-btn"
          aria-label={copy.PREV_ARIA}
        >
          <ChevronLeft className="finai-pagination-btn-icon" aria-hidden="true" />
          <span>{copy.PREV}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="finai-pagination-btn"
          aria-label={copy.NEXT_ARIA}
        >
          <span>{copy.NEXT}</span>
          <ChevronRight className="finai-pagination-btn-icon" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
