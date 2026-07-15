"use client";

import { useState, useMemo } from "react";
import { Filter, Plus, Edit2, Trash2 } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  DataTable,
  SearchBar,
  FilterChips,
  MoneyDisplay,
  Badge,
  Button,
} from "@finai/ui";
import { TransactionDialog } from "./TransactionDialog";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useTransactions, Transaction } from "../api/getTransactions";
import { useDeleteTransaction } from "../api/deleteTransaction";
import { TransactionFilterInput } from "@finai/validation";

const chips = ["All", "Income", "Expenses", "Transfer"];

export function TransactionsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [search, setSearch] = useState("");

  const { activeWorkspaceId } = useActiveWorkspace();

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
    return filter;
  }, [selectedFilter, search]);

  const { data: response, isLoading } = useTransactions(activeWorkspaceId, queryFilter);
  const deleteTransaction = useDeleteTransaction(activeWorkspaceId);

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
        header: "Merchant",
        accessor: (t: Transaction) => t.merchant,
        className: "font-semibold",
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

  const transactionsList = response?.items || [];

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
        <SearchBar
          placeholder="Search merchants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
          <Filter className="size-4" /> Filters
        </Button>
        <FilterChips options={chips} selected={selectedFilter} onChange={setSelectedFilter} />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex items-center justify-center p-12">
          Loading transactions...
        </div>
      ) : (
        <DataTable data={transactionsList} columns={columns} rowKey={(t: Transaction) => t.id} />
      )}
    </PageContainer>
  );
}
