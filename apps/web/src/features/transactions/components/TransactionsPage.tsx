"use client";

import { useState, useMemo } from "react";
import { Filter, Plus, Edit2, Trash2, X } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  DataTable,
  SearchBar,
  FilterChips,
  MoneyDisplay,
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@finai/ui";
import { TransactionDialog } from "./TransactionDialog";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useTransactions, Transaction } from "../api/getTransactions";
import { useDeleteTransaction } from "../api/deleteTransaction";
import { useCategories } from "@/features/categories/api/getCategories";
import { useAccounts } from "@/features/accounts/api/getAccounts";
import { TransactionFilterInput } from "@finai/validation";

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

  const clearFilters = () => {
    setCategoryId("all");
    setAccountId("all");
    setMinAmount("");
    setMaxAmount("");
  };

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

  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessor: (t: Transaction) =>
          new Date(t.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
        className: "whitespace-nowrap text-muted-foreground font-normal",
      },
      {
        header: "Notes",
        accessor: (t: Transaction) => t.notes || "-",
        className: "text-muted-foreground font-normal max-w-[200px] truncate",
      },
      {
        header: "Category",
        accessor: (t: Transaction) => (
          <Badge variant="secondary" className="rounded-full font-normal">
            {t.category?.name || "Uncategorized"}
          </Badge>
        ),
      },
      {
        header: "Account",
        accessor: (t: Transaction) =>
          t.type === "TRANSFER" && t.toAccount
            ? `${t.account?.name || "Unknown"} → ${t.toAccount?.name}`
            : t.account?.name || "Unknown",
        className: "text-muted-foreground font-normal",
      },
      {
        header: "Type",
        accessor: (t: Transaction) => (
          <Badge variant="outline" className="font-normal capitalize">
            {t.type.toLowerCase()}
          </Badge>
        ),
      },
      {
        header: "Amount",
        accessor: (t: Transaction) => {
          const displayAmount = t.type === "EXPENSE" ? -t.amount : t.amount;
          return <MoneyDisplay value={displayAmount} showSign={t.type === "INCOME"} />;
        },
        className: "text-right whitespace-nowrap",
      },
      {
        header: "Actions",
        accessor: (t: Transaction) => (
          <div className="flex justify-end gap-1.5">
            <TransactionDialog
              mode="edit"
              transactionId={t.id}
              initialValues={t}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer"
                >
                  <Edit2 className="size-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer"
              onClick={() => {
                if (confirm("Are you sure you want to delete this transaction?")) {
                  deleteTransaction.mutate(t.id);
                }
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
        className: "text-right",
      },
    ],
    [deleteTransaction],
  );

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
        <DataTable data={transactionsList} columns={columns} rowKey={(t: Transaction) => t.id} />
      )}
    </PageContainer>
  );
}
