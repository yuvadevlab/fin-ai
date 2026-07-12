import React from "react";
import { cn } from "../lib/utils";

interface FilterChipsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function FilterChips({
  options,
  selected,
  onChange,
  className,
  ...props
}: FilterChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} {...props}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "focus-visible:ring-ring cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition outline-none focus-visible:ring-1",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
