"use client";

import React, { useMemo } from "react";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader, ContentCard, MoneyDisplay, Button } from "@finai/ui";
import { cn } from "@finai/ui";
import { useAccounts } from "../api/getAccounts";
import { AccountDialog } from "./AccountDialog";
import { useWorkspace } from "@/providers";

export function AccountsPage() {
  const { workspaceId } = useWorkspace();
  const { data: rawAccounts } = useAccounts(workspaceId);
  // Guard against non-array during hydration
  const accounts = useMemo(() => (Array.isArray(rawAccounts) ? rawAccounts : []), [rawAccounts]);

  const total = React.useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "BANK":
        return "Bank Account";
      case "CREDIT_CARD":
        return "Credit Card";
      case "WALLET":
        return "Digital Wallet";
      case "CASH":
        return "Cash Wallet";
      default:
        return type;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Accounts"
        description={`Consolidated net position across ${accounts.length} accounts: ${total >= 0 ? "" : "-"}${Math.abs(total).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 })}.`}
        actions={
          <AccountDialog
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5">
                <Plus className="size-4" /> Link Account
              </Button>
            }
          />
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <ContentCard key={a.id} className="group flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-foreground text-sm font-bold">{a.name}</p>
                <p className="text-muted-foreground text-xs">{getAccountTypeLabel(a.type)}</p>
              </div>
              <div className="bg-secondary text-foreground flex size-9 items-center justify-center rounded-lg text-xs font-bold">
                {a.name.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-2xl font-bold tracking-tight">
                <MoneyDisplay
                  value={a.balance}
                  className={cn(a.balance < 0 && "text-destructive")}
                />
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status: Active</span>
              <span className="text-muted-foreground font-bold">{a.currency}</span>
            </div>
          </ContentCard>
        ))}
      </section>
    </PageContainer>
  );
}
