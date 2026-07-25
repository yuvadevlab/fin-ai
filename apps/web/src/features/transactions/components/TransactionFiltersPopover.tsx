"use client";

import React from "react";
import {
  Button,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@finai/ui";
import { Filter } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface AccountOption {
  id: string;
  name: string;
}

interface TransactionFiltersPopoverProps {
  categories: CategoryOption[];
  accounts: AccountOption[];
  categoryId: string;
  setCategoryId: (val: string) => void;
  accountId: string;
  setAccountId: (val: string) => void;
  minAmount: string;
  setMinAmount: (val: string) => void;
  maxAmount: string;
  setMaxAmount: (val: string) => void;
  activeFilterCount: number;
  clearFilters: () => void;
}

export function TransactionFiltersPopover({
  categories,
  accounts,
  categoryId,
  setCategoryId,
  accountId,
  setAccountId,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  activeFilterCount,
  clearFilters,
}: TransactionFiltersPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
          <Filter className="size-4" /> Filters
          {activeFilterCount > 0 ? (
            <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 text-[10px] font-semibold">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Refine transactions</p>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              className="text-primary cursor-pointer text-xs hover:underline"
              onClick={clearFilters}
            >
              Reset
            </button>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Account</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Min ₹</Label>
            <Input
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              type="number"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max ₹</Label>
            <Input
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              type="number"
              placeholder="∞"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
