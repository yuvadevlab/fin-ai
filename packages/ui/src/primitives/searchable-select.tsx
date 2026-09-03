import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";
import { Button } from "./button";
import { cn } from "../lib/utils";

export interface SearchableSelectOption {
  label: string;
  value: string;
  group?: string;
  icon?: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  onAddNew?: (searchQuery: string) => void;
  addNewLabel?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  onAddNew,
  addNewLabel = "Add new",
  disabled = false,
  className,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) || (opt.group && opt.group.toLowerCase().includes(q)),
    );
  }, [options, search]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      const idx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setSearch("");
    }
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setHighlightedIndex(0);
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLElement>("[data-highlighted='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, open]);

  // Group options if group field is present
  const groupedOptions = useMemo(() => {
    const hasGroups = filteredOptions.some((opt) => opt.group);
    if (!hasGroups) return { Default: filteredOptions };

    return filteredOptions.reduce<Record<string, SearchableSelectOption[]>>((acc, opt) => {
      const g = opt.group || "Other";
      if (!acc[g]) acc[g] = [];
      acc[g].push(opt);
      return acc;
    }, {});
  }, [filteredOptions]);

  const handleSelect = (val: string) => {
    onChange?.(val);
    setOpen(false);
    setSearch("");
  };

  const handleAddNew = () => {
    onAddNew?.(search.trim());
    setOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOpenChange(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions.length > 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (onAddNew && search.trim()) {
          handleAddNew();
        }
        break;
      case "Escape":
        e.preventDefault();
        handleOpenChange(false);
        break;
      case "Tab":
        handleOpenChange(false);
        break;
    }
  };

  // Flattened index helper for grouped list
  let currentIndex = 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          className={cn(
            "bg-background border-input hover:bg-accent/50 h-control-md w-full justify-between px-3 text-left font-normal",
            !selectedOption && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="border-border bg-popover w-(--radix-popover-trigger-width) min-w-[220px] border p-0 shadow-lg"
        onKeyDown={handleKeyDown}
      >
        <div className="border-border flex items-center gap-2 border-b p-2">
          <Search className="text-muted-foreground h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 border-none bg-transparent px-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <div
          ref={listRef}
          onWheel={(e) => e.stopPropagation()}
          className="max-h-60 overflow-y-auto overscroll-contain p-1 text-sm"
        >
          {Object.keys(groupedOptions).length === 0 ||
          (filteredOptions.length === 0 && !onAddNew) ? (
            <div className="text-muted-foreground py-6 text-center text-xs">
              No matching options found.
            </div>
          ) : (
            Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
              <div key={groupName} className="py-1">
                {groupName !== "Default" && (
                  <div className="text-muted-foreground/70 px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                    {groupName}
                  </div>
                )}
                {groupOpts.map((option) => {
                  const isSelected = option.value === value;
                  const itemIndex = currentIndex++;
                  const isHighlighted = itemIndex === highlightedIndex;

                  return (
                    <div
                      key={option.value}
                      data-highlighted={isHighlighted}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setHighlightedIndex(itemIndex)}
                      className={cn(
                        "relative flex cursor-pointer items-center rounded-sm px-2.5 py-1.5 text-sm transition-colors outline-none select-none",
                        isHighlighted && "bg-accent text-accent-foreground font-medium",
                        isSelected &&
                          !isHighlighted &&
                          "bg-accent/40 text-accent-foreground font-medium",
                      )}
                    >
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && <Check className="text-primary ml-2 h-4 w-4 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {onAddNew && (
          <div className="border-border bg-muted/30 border-t p-1">
            <button
              type="button"
              onClick={handleAddNew}
              className="text-primary hover:bg-primary/10 flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-semibold transition-colors"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {search.trim() ? `${addNewLabel} "${search.trim()}"` : `${addNewLabel}`}
              </span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
