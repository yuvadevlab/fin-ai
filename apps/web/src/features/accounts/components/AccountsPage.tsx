"use client";

import React from "react";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader, ContentCard, MoneyDisplay, Button } from "@finai/ui";
import { cn } from "@finai/ui";

// TODO: Replace with real data from API
interface Account {
  name: string;
  type: string;
  balance: number;
  recent: string;
  change: string;
}

interface AccountsViewProps {
  accounts: Account[];
}

export function AccountsPage({ accounts }: AccountsViewProps) {
  const total = React.useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);

  return (
    <PageContainer>
      <PageHeader
        title="Accounts"
        description={`Consolidated net position across ${accounts.length} accounts: ${total >= 0 ? "" : "-"}${Math.abs(total).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 })}.`}
        actions={
          <Button size="sm" className="cursor-pointer gap-1.5">
            <Plus className="size-4" /> Link Account
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <ContentCard key={a.name} className="group flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-foreground text-sm font-bold">{a.name}</p>
                  <p className="text-muted-foreground text-xs">{a.type}</p>
                </div>
                <div className="bg-secondary text-foreground flex size-9 items-center justify-center rounded-lg text-xs font-bold">
                  {a.name.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <p className="mt-6 text-2xl font-bold tracking-tight">
                <MoneyDisplay
                  value={a.balance}
                  className={cn(a.balance < 0 && "text-destructive")}
                />
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{a.recent}</span>
              <span
                className={cn(
                  "font-bold",
                  a.change.startsWith("+") ? "text-primary" : "text-muted-foreground",
                )}
              >
                {a.change}
              </span>
            </div>
          </ContentCard>
        ))}
      </section>
    </PageContainer>
  );
}
