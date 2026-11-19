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
} from "@fin-ai/ui";
import { formatINR } from "@fin-ai/finance-engine";
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
            <Button size="sm" onClick={handleOpenAddAccount} className="fn-header-action-btn">
              <Plus className="size-4" /> {UI_COPY.ACCOUNTS.LINK_ACCOUNT}
            </Button>
          )
        }
      />

      {isReadOnly && <ReadOnlyWorkspaceBanner />}

      {isClient && !isLoading && accounts.length === 0 ? (
        <div className="fn-accounts-empty">
          <div className="fn-accounts-empty-icon">
            <Wallet className="fn-entity-empty-icon-svg" />
          </div>
          <h3 className="fn-entity-empty-title">{UI_COPY.ACCOUNTS.EMPTY_TITLE}</h3>
          <p className="fn-entity-empty-desc">{UI_COPY.ACCOUNTS.EMPTY_DESCRIPTION}</p>
          {!isReadOnly && (
            <Button size="sm" onClick={handleOpenAddAccount} className="fn-entity-empty-btn">
              <Plus className="size-4" /> {UI_COPY.ACCOUNTS.LINK_FIRST}
            </Button>
          )}
        </div>
      ) : (
        <section className="fn-accounts-grid">
          {accounts.map((a) => (
            <div key={a.id} className={cn("fn-account-card", a.isDefault && "is-default")}>
              {/* Header: Name, Type, and visible Edit/Delete actions */}
              <div className="fn-account-card-header">
                <div className="fn-account-header-info">
                  <div className="fn-account-avatar">{a.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="fn-account-title-wrap">
                      <p className="fn-account-name">{a.name}</p>
                      {a.isDefault && (
                        <span className="fn-account-default-badge">
                          <Star className="fn-account-star-icon" />
                          {UI_COPY.ACCOUNTS.DEFAULT_BADGE}
                        </span>
                      )}
                    </div>
                    <p className="fn-account-type">{getAccountTypeLabel(a.type)}</p>
                  </div>
                </div>

                {/* Actions Dropdown Menu */}
                {!isReadOnly && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="fn-account-menu-trigger"
                        aria-label={`Actions for ${a.name}`}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="fn-account-menu-content">
                      {!a.isDefault && accounts.length > 1 && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(a.id)}
                          className="fn-account-menu-item"
                        >
                          <Star className="fn-account-menu-icon" />{" "}
                          {UI_COPY.ACCOUNTS.SET_DEFAULT_ACTION}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleOpenEditAccount(a)}
                        className="fn-account-menu-item"
                      >
                        <Pencil className="fn-account-menu-icon" /> {UI_COPY.ACCOUNTS.EDIT_ACTION}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleOpenDeleteAccount(a)}
                        className="fn-account-menu-item-destructive"
                      >
                        <Trash2 className="fn-account-menu-icon" /> {UI_COPY.ACCOUNTS.DELETE_ACTION}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Account Balance */}
              <div className="fn-account-balance">
                <p className="fn-account-balance-val">
                  <PrivacyMoney value={a.balance} className={cn(a.balance < 0 && "is-negative")} />
                </p>
              </div>

              {/* Status Footer */}
              <div className="fn-account-card-footer">
                <span className="fn-account-status">{UI_COPY.ACCOUNTS.ACTIVE_STATUS}</span>
                <span className="fn-account-currency">{a.currency}</span>
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
