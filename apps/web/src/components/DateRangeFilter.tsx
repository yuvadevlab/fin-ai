"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverTrigger, Input, Label } from "@finai/ui";
import { format } from "date-fns";
import { getAccountingCycleRange, getPresetDateRanges } from "@/lib/dateCycle";
import type { CyclePeriod } from "@finai/shared-types";

export interface DateRangeFilterProps {
  cycleStartDay?: number;
  cyclePeriod?: CyclePeriod;
  onRangeChange: (range: { startDate: Date; endDate: Date }) => void;
  className?: string;
}

export function DateRangeFilter({
  cycleStartDay = 1,
  cyclePeriod = "MONTHLY",
  onRangeChange,
  className,
}: DateRangeFilterProps) {
  const presets = getPresetDateRanges(cycleStartDay, cyclePeriod);
  const [selectedPreset, setSelectedPreset] = useState<string>("DEFAULT_CYCLE");
  const [customStart, setCustomStart] = useState<string>(
    format(presets.DEFAULT_CYCLE.startDate, "yyyy-MM-dd"),
  );
  const [customEnd, setCustomEnd] = useState<string>(
    format(presets.DEFAULT_CYCLE.endDate, "yyyy-MM-dd"),
  );
  const [open, setOpen] = useState(false);

  const onRangeChangeRef = useRef(onRangeChange);
  useEffect(() => {
    onRangeChangeRef.current = onRangeChange;
  });

  // Trigger default on mount or preference changes
  useEffect(() => {
    const defaultRange = getAccountingCycleRange(cycleStartDay, cyclePeriod);
    onRangeChangeRef.current({
      startDate: defaultRange.startDate,
      endDate: defaultRange.endDate,
    });
  }, [cycleStartDay, cyclePeriod]);

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    if (key !== "CUSTOM") {
      const preset = presets[key];
      if (preset) {
        setCustomStart(format(preset.startDate, "yyyy-MM-dd"));
        setCustomEnd(format(preset.endDate, "yyyy-MM-dd"));
        onRangeChange({ startDate: preset.startDate, endDate: preset.endDate });
      }
    }
    setOpen(false);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      setSelectedPreset("CUSTOM");
      onRangeChange({ startDate: start, endDate: end });
      setOpen(false);
    }
  };

  const currentLabel =
    selectedPreset === "CUSTOM"
      ? `${customStart} to ${customEnd}`
      : presets[selectedPreset]?.label || "Date Filter";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`border-border bg-card text-foreground hover:bg-secondary/60 h-9 gap-2 font-medium ${className}`}
        >
          <CalendarIcon className="text-primary size-4 shrink-0" />
          <span className="max-w-[200px] truncate">{currentLabel}</span>
          <ChevronDown className="ml-auto size-3.5 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-card border-border w-80 space-y-3 rounded-xl p-3 shadow-lg"
        align="end"
      >
        <div className="text-muted-foreground px-1 text-xs font-semibold tracking-wider uppercase">
          Select Date Range
        </div>
        <div className="space-y-1">
          {Object.entries(presets).map(([key, item]) => (
            <button
              key={key}
              onClick={() => handleSelectPreset(key)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                selectedPreset === key
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="border-border space-y-2 border-t pt-3">
          <div className="text-muted-foreground px-1 text-xs font-semibold">Custom Range</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-muted-foreground text-[10px]">From</Label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-[10px]">To</Label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 font-mono text-xs"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleCustomApply} className="mt-1 h-8 w-full text-xs">
            Apply Custom Range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
