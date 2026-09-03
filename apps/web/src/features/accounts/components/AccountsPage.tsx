"use client";

import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Wallet, Star } from "lucide-react";
import { PageContainer, PageHeader, Button, ConfirmDialog } from "@finai/ui";
import { cn } from "@finai/ui";
import { formatINR } from "@finai/finance-engine";
import { useIsClient } from "@/hooks";
import { usePrivacyMode } from "@/hooks";
import { PrivacyMoney } from "@/components";
import { AccountDialog } from "./AccountDialog";
import { Account, useAccounts, useDeleteAccount, useSetDefaultAccount } from "../api";

export function AccountsPage() {
  const isClient = useIsClient();
  const { isPrivacyMode } = usePrivacyMode();
  const { data: rawAccounts, isLoading } = useAccounts();
  const deleteAccount = useDeleteAccount();
  const setDefaultAccount = useSetDefaultAccount();

  // Guard against non-array during hydration
  const accounts = useMemo(() => (Array.isArray(rawAccounts) ? rawAccounts : []), [rawAccounts]);
  const total = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);

  // Account Add/Edit modal state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

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

  const handleOpenAddAccount = () => {
    setSelectedAccount(null);
    setFormOpen(true);
  };

  const handleOpenEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setFormOpen(true);
  };

  const handleOpenDeleteAccount = (account: Account) => {
    setAccountToDelete(account);
    setDeleteOpen(true);
  };

  const handleDeleteAccountConfirm = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccount.mutateAsync(accountToDelete.id);
      setDeleteOpen(false);
      setAccountToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAccount.mutateAsync(id);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Accounts"
        description={
          isClient && accounts.length > 0
            ? `Consolidated net position across ${accounts.length} accounts: ${isPrivacyMode ? "₹ ••••••" : formatINR(total)}.`
            : "Consolidated net position across all your linked bank accounts, cards, and wallets."
        }
        actions={
          <Button size="sm" onClick={handleOpenAddAccount} className="cursor-pointer gap-1.5">
            <Plus className="size-4" /> Link Account
          </Button>
        }
      />

      {isClient && !isLoading && accounts.length === 0 ? (
        <div className="bg-card border-border flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm">
          <div className="bg-secondary mb-4 flex size-12 items-center justify-center rounded-2xl">
            <Wallet className="text-muted-foreground size-6" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No accounts linked yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Link your bank accounts, credit cards, or digital wallets to track your net worth and
            cash flow.
          </p>
          <Button size="sm" onClick={handleOpenAddAccount} className="mt-5 cursor-pointer gap-1.5">
            <Plus className="size-4" /> Link First Account
          </Button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <div
              key={a.id}
              className={cn(
                "bg-card border-border flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all",
                a.isDefault
                  ? "border-primary/30 ring-primary/20 ring-1"
                  : "hover:border-primary/20",
              )}
            >
              {/* Header: Name, Type, and visible Edit/Delete actions */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary text-foreground flex size-10 items-center justify-center rounded-xl text-xs font-bold">
                    {a.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-foreground text-sm font-semibold">{a.name}</p>
                      {a.isDefault && (
                        <span className="bg-primary/10 text-primary flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                          <Star className="size-2.5 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">{getAccountTypeLabel(a.type)}</p>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons — always visible */}
                <div className="flex items-center gap-1">
                  {!a.isDefault && accounts.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary size-8 cursor-pointer"
                      onClick={() => handleSetDefault(a.id)}
                      aria-label={`Set ${a.name} as default`}
                      title="Set as default account"
                    >
                      <Star className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
                    onClick={() => handleOpenEditAccount(a)}
                    aria-label={`Edit ${a.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive size-8 cursor-pointer"
                    onClick={() => handleOpenDeleteAccount(a)}
                    aria-label={`Delete ${a.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Account Balance */}
              <div className="mt-5">
                <p className="text-2xl font-bold tracking-tight">
                  <PrivacyMoney
                    value={a.balance}
                    className={cn(a.balance < 0 && "text-destructive")}
                  />
                </p>
              </div>

              {/* Status Footer */}
              <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">Status: Active</span>
                <span className="text-muted-foreground font-semibold">{a.currency}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Add / Edit Account Dialog */}
      <AccountDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        account={selectedAccount ?? undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove Account"
        description={`Are you sure you want to remove "${accountToDelete?.name}"? This will hide the account from your dashboard while keeping your transaction history intact.`}
        confirmText="Remove"
        destructive
        onConfirm={handleDeleteAccountConfirm}
      />
    </PageContainer>
  );
}
