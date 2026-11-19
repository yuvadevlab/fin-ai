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
} from "@fin-ai/ui";
import { Filter } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

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
        <Button variant="outline" size="sm" className="fn-filter-trigger">
          <Filter className="fn-notifications-action-icon" /> {UI_COPY.TRANSACTIONS.FILTERS}
          {activeFilterCount > 0 ? (
            <span className="fn-filter-badge">{activeFilterCount}</span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="fn-transactions-filter-popover">
        <div className="fn-filter-header">
          <p className="fn-filter-title">{UI_COPY.TRANSACTIONS.FILTER_TITLE}</p>
          {activeFilterCount > 0 ? (
            <button type="button" className="fn-filter-reset" onClick={clearFilters}>
              {UI_COPY.TRANSACTIONS.RESET_FILTERS}
            </button>
          ) : null}
        </div>
        <div className="fn-filter-group">
          <Label className="fn-filter-label">{UI_COPY.TRANSACTIONS.CATEGORY_LABEL}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{UI_COPY.TRANSACTIONS.ALL_CATEGORIES}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="fn-filter-group">
          <Label className="fn-filter-label">{UI_COPY.TRANSACTIONS.ACCOUNT_LABEL}</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{UI_COPY.TRANSACTIONS.ALL_ACCOUNTS}</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="fn-filter-grid-2">
          <div className="fn-filter-group">
            <Label className="fn-filter-label">{UI_COPY.TRANSACTIONS.MIN_AMOUNT}</Label>
            <Input
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              type="number"
              placeholder={UI_COPY.TRANSACTIONS.MIN_AMOUNT_PLACEHOLDER}
            />
          </div>
          <div className="fn-filter-group">
            <Label className="fn-filter-label">{UI_COPY.TRANSACTIONS.MAX_AMOUNT}</Label>
            <Input
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              type="number"
              placeholder={UI_COPY.TRANSACTIONS.MAX_AMOUNT_PLACEHOLDER}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
