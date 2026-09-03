"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, X } from "lucide-react";
import {
  TablePageContainer,
  PageHeader,
  DataTable,
  SearchBar,
  FilterChips,
  Button,
} from "@finai/ui";
import { TransactionFilterInput } from "@finai/validation";
import { format } from "date-fns";
import { useCategories } from "@/features/categories/api";
import { useAccounts } from "@/features/accounts/api";
import { DateRangeFilter } from "@/components/DateRangeFilter";

import { useTransactions, useDeleteTransaction } from "../api";
import { TransactionDialog } from "./TransactionDialog";
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
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const queryFilter = useMemo(() => {
    const filter: TransactionFilterInput = {
      page,
      pageSize,
      sortOrder: "desc",
    };
    if (search) filter.search = search;
    if (selectedFilter === "Income") filter.type = "INCOME";
    if (selectedFilter === "Expenses") filter.type = "EXPENSE";
    if (selectedFilter === "Transfer") filter.type = "TRANSFER";
    if (categoryId !== "all") filter.category = categoryId;
    if (accountId !== "all") filter.account = accountId;
    if (dateRange.startDate) filter.dateFrom = format(dateRange.startDate, "yyyy-MM-dd");
    if (dateRange.endDate) filter.dateTo = format(dateRange.endDate, "yyyy-MM-dd");
    return filter;
  }, [selectedFilter, search, categoryId, accountId, dateRange, page, pageSize]);

  const { data: response, isLoading } = useTransactions(queryFilter);
  const deleteTransaction = useDeleteTransaction();

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
    <TablePageContainer
      header={
        <>
          <PageHeader
            title="Transactions"
            description="All income, expenses, and transfers."
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

          {/* Filter toolbar */}
          <div className="bg-card ring-border/50 flex flex-col gap-2.5 rounded-2xl p-3 shadow-sm ring-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-4">
            <div className="relative w-full sm:w-auto sm:min-w-64 sm:flex-1">
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

            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start sm:gap-3">
              <DateRangeFilter
                onRangeChange={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
              />

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
            </div>

            <div className="w-full overflow-x-auto py-0.5 sm:w-auto">
              <FilterChips options={chips} selected={selectedFilter} onChange={setSelectedFilter} />
            </div>
          </div>
        </>
      }
    >
      {isLoading ? (
        <div className="bg-card ring-border/50 flex h-full min-h-75 items-center justify-center rounded-2xl shadow-sm ring-1">
          <p className="text-muted-foreground text-sm">Loading transactions…</p>
        </div>
      ) : transactionsList.length === 0 ? (
        <div className="bg-card ring-border/50 flex h-full min-h-75 items-center justify-center rounded-2xl shadow-sm ring-1">
          <p className="text-muted-foreground text-sm">No transactions match your filters.</p>
        </div>
      ) : (
        <DataTable
          fillViewport
          data={transactionsList}
          columns={columns}
          rowKey={(t) => t.id}
          pagination={
            response
              ? {
                  currentPage: response.page,
                  totalPages: response.totalPages,
                  pageSize: response.limit || pageSize,
                  totalItems: response.total,
                  onPageChange: (newPage) => setPage(newPage),
                  onPageSizeChange: (newPageSize) => {
                    setPageSize(newPageSize);
                    setPage(1);
                  },
                }
              : undefined
          }
        />
      )}
    </TablePageContainer>
  );
}
