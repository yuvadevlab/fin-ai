"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { PageContainer, PageHeader, DataTable, SearchBar, FilterChips, Button } from "@finai/ui";
import { TransactionDialog } from "./TransactionDialog";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useTransactions } from "../api/getTransactions";
import { useDeleteTransaction } from "../api/deleteTransaction";
import { useCategories } from "@/features/categories/api/getCategories";
import { useAccounts } from "@/features/accounts/api/getAccounts";
import { TransactionFilterInput } from "@finai/validation";
import { getTransactionColumns } from "./TransactionColumns";
import { TransactionFiltersPopover } from "./TransactionFiltersPopover";

const chips = ["All", "Income", "Expenses", "Transfer"];

export function TransactionsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const { activeWorkspaceId } = useActiveWorkspace();
  const { data: categories = [] } = useCategories(activeWorkspaceId);
  const { data: accounts = [] } = useAccounts(activeWorkspaceId);

  const queryFilter = useMemo(() => {
    const filter: TransactionFilterInput = {
      page: 1,
      pageSize: 50,
      sortOrder: "desc",
    };
    if (search) filter.search = search;
    if (selectedFilter === "Income") filter.type = "INCOME";
    if (selectedFilter === "Expenses") filter.type = "EXPENSE";
    if (selectedFilter === "Transfer") filter.type = "TRANSFER";
    if (categoryId !== "all") filter.category = categoryId;
    if (accountId !== "all") filter.account = accountId;
    return filter;
  }, [selectedFilter, search, categoryId, accountId]);

  const { data: response, isLoading } = useTransactions(activeWorkspaceId, queryFilter);
  const deleteTransaction = useDeleteTransaction(activeWorkspaceId);

  const activeFilterCount =
    (categoryId !== "all" ? 1 : 0) +
    (accountId !== "all" ? 1 : 0) +
    (minAmount ? 1 : 0) +
    (maxAmount ? 1 : 0);

  const clearFilters = useCallback(() => {
    setCategoryId("all");
    setAccountId("all");
    setMinAmount("");
    setMaxAmount("");
  }, []);

  const transactionsList = useMemo(() => {
    const items = response?.items ?? [];
    if (!minAmount && !maxAmount) return items;

    return items.filter((t) => {
      const abs = Math.abs(t.amount);
      if (minAmount && abs < Number(minAmount)) return false;
      if (maxAmount && abs > Number(maxAmount)) return false;
      return true;
    });
  }, [response?.items, minAmount, maxAmount]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteTransaction.mutate(id);
    },
    [deleteTransaction],
  );

  const columns = useMemo(() => getTransactionColumns(handleDelete), [handleDelete]);

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        description="All income, expenses, and transfers across your workspaces."
        actions={
          <TransactionDialog
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5">
                <Plus className="size-4" /> Add Transaction
              </Button>
            }
          />
        }
      />

      <div className="bg-card ring-border/50 flex flex-wrap items-center gap-3 rounded-2xl p-4 shadow-sm ring-1">
        <div className="relative min-w-64 flex-1">
          <SearchBar
            placeholder="Search notes, categories, accounts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="w-full"
            className="pr-9"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:bg-secondary absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer rounded-md p-1"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <TransactionFiltersPopover
          categories={categories}
          accounts={accounts}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          accountId={accountId}
          setAccountId={setAccountId}
          minAmount={minAmount}
          setMinAmount={setMinAmount}
          maxAmount={maxAmount}
          setMaxAmount={setMaxAmount}
          activeFilterCount={activeFilterCount}
          clearFilters={clearFilters}
        />

        <FilterChips options={chips} selected={selectedFilter} onChange={setSelectedFilter} />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex items-center justify-center p-12">
          Loading transactions...
        </div>
      ) : transactionsList.length === 0 ? (
        <div className="text-muted-foreground flex items-center justify-center p-12 text-sm">
          No transactions match your filters.
        </div>
      ) : (
        <DataTable data={transactionsList} columns={columns} rowKey={(t) => t.id} />
      )}
    </PageContainer>
  );
}
