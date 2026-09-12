"use client";

import { Check, Loader2 } from "lucide-react";
import {
  Badge,
  Button,
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@finai/ui";

export interface ParsedTransaction {
  amount: string;
  type: string;
  account: string;
  category: string;
  date: string;
  notes: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export function parseTransactions(rows: [string, string | null][]): ParsedTransaction[] {
  const txMap = new Map<number, ParsedTransaction>();
  for (const entry of rows) {
    const key = entry[0];
    const value = entry[1];
    if (key == null || value == null) continue;
    const match = key.match(/^#(\d+)\s+(.+)$/);
    if (!match) continue;
    const idx = parseInt(match[1], 10);
    const field = match[2].toLowerCase();
    if (!txMap.has(idx)) {
      txMap.set(idx, { amount: "", type: "", account: "", category: "", date: "", notes: "" });
    }
    const tx = txMap.get(idx)!;
    const safeValue = value ?? "";
    if (field === "amount") tx.amount = safeValue;
    else if (field === "type") tx.type = safeValue;
    else if (field === "account") tx.account = safeValue;
    else if (field === "account id") {
      tx.account = `${tx.account} (${safeValue.slice(0, 8)})`;
    } else if (field === "category") tx.category = safeValue;
    else if (field === "category id") {
      tx.category = `${tx.category} (${safeValue.slice(0, 8)})`;
    } else if (field === "date") tx.date = safeValue;
    else if (field === "notes") tx.notes = safeValue;
  }
  return Array.from(txMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, tx]) => tx);
}

interface BulkTransactionTableProps {
  transactions: ParsedTransaction[];
  pending: boolean;
  isExecuting: boolean;
  executingItemIndex: number | null;
  actionId: string;
  tool: string;
  onConfirmItem: (actionId: string, tool: string, index: number) => void;
  /** Indexes already confirmed individually — their Confirm button is hidden. */
  confirmedItems: number[];
}

/**
 * Dense table view for 4+ transactions — every row gets its own Confirm
 * button, plus a Confirm All at the bottom of the parent card.
 * Styling follows the TransactionsPage table conventions.
 */
export function BulkTransactionTable({
  transactions,
  pending,
  isExecuting,
  executingItemIndex,
  actionId,
  tool,
  onConfirmItem,
  confirmedItems,
}: BulkTransactionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-24 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx, idx) => {
          const isRowExecuting = executingItemIndex === idx;
          return (
            <TableRow key={idx}>
              <TableCell className="text-muted-foreground text-xs font-normal">{idx + 1}</TableCell>
              <TableCell className="text-xs font-semibold">{tx.amount}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-normal capitalize",
                    tx.type === "EXPENSE" && "text-destructive",
                    tx.type === "INCOME" && "text-primary",
                    tx.type === "TRANSFER" && "text-blue-600",
                  )}
                >
                  {tx.type.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs font-normal">
                {tx.account || "—"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="rounded-full text-xs font-normal">
                  {tx.category || "Uncategorized"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs font-normal">
                {tx.date || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-32 truncate text-xs font-normal">
                {tx.notes || "—"}
              </TableCell>
              <TableCell className="text-right">
                {pending && !confirmedItems.includes(idx) && (
                  <Button
                    size="sm"
                    className="cursor-pointer gap-1"
                    disabled={isExecuting && !isRowExecuting}
                    onClick={() => onConfirmItem(actionId, tool, idx)}
                  >
                    {isRowExecuting ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3" />
                    )}
                    Confirm
                  </Button>
                )}
                {pending && confirmedItems.includes(idx) && (
                  <span className="text-primary text-xs font-medium">Confirmed ✓</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
