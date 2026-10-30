"use client";

import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Wallet, Star, MoreVertical } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  cn,
} from "@finai/ui";
import { formatINR } from "@finai/finance-engine";
import { useIsClient } from "@/hooks";
import { usePrivacyMode } from "@/hooks";
import { UI_COPY } from "@/lib/ui-copy";
import { PrivacyMoney, ReadOnlyWorkspaceBanner } from "@/components";
import { useWorkspace } from "@/providers";
import { AccountDialog } from "./AccountDialog";
import { Account, useAccounts, useDeleteAccount, useSetDefaultAccount } from "../api";

export function AccountsPage() {
  const { isReadOnly } = useWorkspace();
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

  const getAccountTypeLabel = (type: string) =>
    ({
      BANK: UI_COPY.ACCOUNTS.TYPES.BANK,
      CREDIT_CARD: UI_COPY.ACCOUNTS.TYPES.CREDIT_CARD,
      WALLET: UI_COPY.ACCOUNTS.TYPES.DIGITAL_WALLET,
      CASH: UI_COPY.ACCOUNTS.TYPES.CASH_WALLET,
    })[type] ?? type;

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
    await deleteAccount.mutateAsync(accountToDelete.id).catch(() => {});
    setDeleteOpen(false);
    setAccountToDelete(null);
  };

  const handleSetDefault = (id: string) => setDefaultAccount.mutate(id);

  return (
    <PageContainer>
      <PageHeader
        title={UI_COPY.ACCOUNTS.PAGE_TITLE}
        description={
          isClient && accounts.length > 0
            ? UI_COPY.ACCOUNTS.BALANCE_DESCRIPTION(
                accounts.length,
                isPrivacyMode ? "₹ ••••••" : formatINR(total),
              )
            : UI_COPY.ACCOUNTS.PAGE_DESCRIPTION
        }
        actions={
          isReadOnly ? undefined : (
            <Button size="sm" onClick={handleOpenAddAccount} className="cursor-pointer gap-1.5">
              <Plus className="size-4" /> {UI_COPY.ACCOUNTS.LINK_ACCOUNT}
            </Button>
          )
        }
      />

      {isReadOnly && <ReadOnlyWorkspaceBanner />}

      {isClient && !isLoading && accounts.length === 0 ? (
        <div className="bg-card border-border flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm">
          <div className="bg-secondary mb-4 flex size-12 items-center justify-center rounded-2xl">
            <Wallet className="text-muted-foreground size-6" />
          </div>
          <h3 className="text-foreground text-base font-semibold">
            {UI_COPY.ACCOUNTS.EMPTY_TITLE}
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            {UI_COPY.ACCOUNTS.EMPTY_DESCRIPTION}
          </p>
          {!isReadOnly && (
            <Button
              size="sm"
              onClick={handleOpenAddAccount}
              className="mt-5 cursor-pointer gap-1.5"
            >
              <Plus className="size-4" /> {UI_COPY.ACCOUNTS.LINK_FIRST}
            </Button>
          )}
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
                          {UI_COPY.ACCOUNTS.DEFAULT_BADGE}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">{getAccountTypeLabel(a.type)}</p>
                  </div>
                </div>

                {/* Actions Dropdown Menu */}
                {!isReadOnly && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
                        aria-label={`Actions for ${a.name}`}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {!a.isDefault && accounts.length > 1 && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(a.id)}
                          className="cursor-pointer"
                        >
                          <Star className="mr-2 size-3.5" /> {UI_COPY.ACCOUNTS.SET_DEFAULT_ACTION}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleOpenEditAccount(a)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 size-3.5" /> {UI_COPY.ACCOUNTS.EDIT_ACTION}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleOpenDeleteAccount(a)}
                        className="text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 size-3.5" /> {UI_COPY.ACCOUNTS.DELETE_ACTION}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
                <span className="text-muted-foreground">{UI_COPY.ACCOUNTS.ACTIVE_STATUS}</span>
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
        title={UI_COPY.ACCOUNTS.REMOVE_TITLE}
        description={UI_COPY.ACCOUNTS.REMOVE_CONFIRMATION(accountToDelete?.name ?? "")}
        confirmText={UI_COPY.ACCOUNTS.REMOVE_BUTTON}
        destructive
        onConfirm={handleDeleteAccountConfirm}
      />
    </PageContainer>
  );
}
