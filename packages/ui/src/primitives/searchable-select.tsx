import * as React from "react";
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
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) || (opt.group && opt.group.toLowerCase().includes(q)),
    );
  }, [options, search]);

  // Group options if group field is present
  const groupedOptions = React.useMemo(() => {
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
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "bg-background border-input hover:bg-accent/50 h-10 w-full justify-between px-3 text-left font-normal",
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
        className="border-border bg-popover w-[var(--radix-popover-trigger-width)] min-w-[220px] border p-0 shadow-lg"
      >
        <div className="border-border flex items-center gap-2 border-b p-2">
          <Search className="text-muted-foreground h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-none bg-transparent px-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <div className="max-h-60 overflow-y-auto p-1 text-sm">
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
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2.5 py-1.5 text-sm transition-colors outline-none select-none",
                        isSelected && "bg-accent/60 text-accent-foreground font-medium",
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
