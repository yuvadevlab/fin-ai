"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  // Parse date safely in local timezone to avoid UTC shifting
  const date = React.useMemo(() => {
    if (!value) return undefined;
    const parts = value.split("-");
    if (parts.length !== 3) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? undefined : d;
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-based month
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0); // Local noon
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          disabled={disabled}
          className={cn(
            "border-border/80 bg-secondary/40 hover:bg-secondary/60 hover:text-foreground w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date && !isNaN(date.getTime()) ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) =>
            onChange?.(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
