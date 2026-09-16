import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { DataTable } from "./DataTable";
import { MoneyDisplay } from "./MoneyDisplay";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import type { TransactionType } from "@finai/shared-types";

interface SampleTransaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: TransactionType;
}

const sampleData: SampleTransaction[] = [
  {
    id: "tx-1",
    date: "2025-05-12",
    merchant: "Swiggy",
    category: "Food & Dining",
    amount: -450,
    type: "EXPENSE",
  },
  {
    id: "tx-2",
    date: "2025-05-11",
    merchant: "Acme Corp (Salary)",
    category: "Income",
    amount: 120000,
    type: "INCOME",
  },
  {
    id: "tx-3",
    date: "2025-05-10",
    merchant: "Zerodha Funds",
    category: "Mutual Funds",
    amount: -15000,
    type: "INVESTMENT",
  },
  {
    id: "tx-4",
    date: "2025-05-09",
    merchant: "Amazon",
    category: "Shopping",
    amount: -2499,
    type: "EXPENSE",
  },
];

const columns = [
  { header: "Date", accessor: (row: SampleTransaction) => row.date },
  { header: "Merchant", accessor: (row: SampleTransaction) => row.merchant },
  { header: "Category", accessor: (row: SampleTransaction) => row.category },
  {
    header: "Type",
    accessor: (row: SampleTransaction) => <TransactionTypeBadge type={row.type} />,
  },
  {
    header: "Amount",
    className: "text-right",
    accessor: (row: SampleTransaction) => (
      <MoneyDisplay value={row.amount} showSign className="text-sm font-semibold" />
    ),
  },
];

/**
 * `DataTable` provides tabular data presentation with sorting headers,
 * clickable rows, and integrated pagination.
 */
const meta: Meta<typeof DataTable<SampleTransaction>> = {
  title: "Components / DataTable",
  component: DataTable,
  tags: ["autodocs"],
  args: {
    data: sampleData,
    columns,
    rowKey: (item) => item.id,
    onRowClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<SampleTransaction>>;

/** Standard table with rows. */
export const Default: Story = {};

/** Empty state when no records match filter. */
export const EmptyState: Story = {
  args: {
    data: [],
  },
};

/** With pagination controls docked. */
export const WithPagination: Story = {
  args: {
    pagination: {
      currentPage: 1,
      totalPages: 4,
      pageSize: 4,
      totalItems: 16,
      onPageChange: fn(),
    },
  },
};
