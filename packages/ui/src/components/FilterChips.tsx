import React from "react";
import { cn } from "../lib/utils";

interface FilterChipsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

/**
 * Horizontal scrollable row of filter chip buttons.
 * Semantic classes: `.fn-filter-chips`, `.fn-filter-chip`, `.fn-filter-chip--active`
 */
export function FilterChips({
  options,
  selected,
  onChange,
  className,
  ...props
}: FilterChipsProps) {
  return (
    <div className={cn("fn-filter-chips", className)} {...props}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn("fn-filter-chip", selected === opt && "fn-filter-chip--active")}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
