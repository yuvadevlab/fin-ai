"use client";

import React from "react";
import { Filter, Plus } from "lucide-react";
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

// TODO: Replace with real data from API
interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  account: string;
  workspace: string;
  amount: number;
}

interface TransactionsPageProps {
  transactions: Transaction[];
}

const chips = ["All", "Personal", "Family", "Income", "Expenses", "Investments"];

export function TransactionsPage({ transactions }: TransactionsPageProps) {
  const [selectedFilter, setSelectedFilter] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(
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
            {t.category}
          </Badge>
        ),
      },
      {
        header: "Account",
        accessor: (t: Transaction) => t.account,
        className: "text-muted-foreground font-normal",
      },
      {
        header: "Workspace",
        accessor: (t: Transaction) => t.workspace,
        className: "text-muted-foreground font-normal",
      },
      {
        header: "Amount",
        accessor: (t: Transaction) => <MoneyDisplay value={t.amount} showSign={t.amount > 0} />,
        className: "text-right whitespace-nowrap",
      },
    ],
    [],
  );

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (selectedFilter === "All") return true;
      if (selectedFilter === "Personal") return t.workspace === "Personal";
      if (selectedFilter === "Family") return t.workspace === "Family";
      if (selectedFilter === "Income") return t.amount > 0;
      if (selectedFilter === "Expenses") return t.amount < 0 && t.category !== "Investment";
      if (selectedFilter === "Investments") return t.category === "Investment";
      return true;
    });
  }, [selectedFilter, search, transactions]);

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        description="All income, expenses, and transfers across your workspaces."
        actions={
          <Button size="sm" className="cursor-pointer gap-1.5">
            <Plus className="size-4" /> Add Transaction
          </Button>
        }
      />

      <div className="bg-card ring-border/50 flex flex-wrap items-center gap-3 rounded-2xl p-4 shadow-sm ring-1">
        <SearchBar
          placeholder="Search merchants, notes, tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
          <Filter className="size-4" /> Filters
        </Button>
        <FilterChips options={chips} selected={selectedFilter} onChange={setSelectedFilter} />
      </div>

      <DataTable data={filteredTransactions} columns={columns} rowKey={(t: Transaction) => t.id} />
    </PageContainer>
  );
}
