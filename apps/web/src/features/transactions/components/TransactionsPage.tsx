"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { PageContainer, PageHeader, DataTable, SearchBar, FilterChips, Button } from "@finai/ui";
import { TransactionFilterInput } from "@finai/validation";
import { format } from "date-fns";
import { useCategories } from "@/features/categories/api";
import { useAccounts } from "@/features/accounts/api";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { LiveAIInsightCard } from "@/features/ai-advisor/components";
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
    <PageContainer>
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

      <div className="mb-6">
        <LiveAIInsightCard page="transactions" cta="Analyze spending" />
      </div>

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
        <DataTable
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
    </PageContainer>
  );
}
