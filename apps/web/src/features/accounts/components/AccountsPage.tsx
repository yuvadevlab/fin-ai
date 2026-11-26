"use client";

import React, { useState, useMemo } from "react";
import { Plus, Wallet } from "lucide-react";
import { PageContainer, PageHeader, Button, ConfirmDialog } from "@fin-ai/ui";
import { formatINR } from "@fin-ai/finance-engine";
import { TransactionKind, TransactionType } from "@fin-ai/shared-types";
import { useIsClient, usePrivacyMode } from "@/hooks";
import { UI_COPY } from "@/lib/ui-copy";
import { ReadOnlyWorkspaceBanner } from "@/components";
import { useWorkspace } from "@/providers";
import { TransactionDialog } from "@/features/transactions/components";
import { AccountDialog } from "./AccountDialog";
import { AccountCard } from "./AccountCard";
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

  // Pay credit card bill state
  const [payCardAccount, setPayCardAccount] = useState<Account | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);

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

  const handleOpenPayCard = (account: Account) => {
    setPayCardAccount(account);
    setPayDialogOpen(true);
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
          !isReadOnly && (
            <Button size="sm" onClick={handleOpenAddAccount} className="fn-header-action-btn">
              <Plus className="fn-icon-md" />
              {UI_COPY.ACCOUNTS.LINK_ACCOUNT}
            </Button>
          )
        }
      />

      {isReadOnly && <ReadOnlyWorkspaceBanner />}

      {/* Accounts Grid or Empty State */}
      {isClient && !isLoading && accounts.length === 0 ? (
        <section className="fn-accounts-empty" aria-label={UI_COPY.ACCOUNTS.EMPTY_TITLE}>
          <div className="fn-account-empty-icon-wrap">
            <Wallet className="fn-account-empty-icon" />
          </div>
          <p className="fn-account-empty-title">{UI_COPY.ACCOUNTS.EMPTY_TITLE}</p>
          <p className="fn-account-empty-desc">{UI_COPY.ACCOUNTS.EMPTY_DESCRIPTION}</p>
          {!isReadOnly && (
            <Button onClick={handleOpenAddAccount} className="fn-account-empty-btn">
              <Plus className="fn-icon-md mr-1.5" />
              {UI_COPY.ACCOUNTS.LINK_FIRST}
            </Button>
          )}
        </section>
      ) : (
        <section className="fn-accounts-grid" aria-label={UI_COPY.ACCOUNTS.LINKED_ACCOUNTS}>
          {accounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              accounts={accounts}
              isReadOnly={isReadOnly}
              onSetDefault={handleSetDefault}
              onEdit={handleOpenEditAccount}
              onDelete={handleOpenDeleteAccount}
              onPayCard={handleOpenPayCard}
            />
          ))}
        </section>
      )}

      {/* Pay Credit Card Bill Dialog */}
      {payCardAccount && (
        <TransactionDialog
          open={payDialogOpen}
          onOpenChange={(open) => {
            setPayDialogOpen(open);
            if (!open) setPayCardAccount(null);
          }}
          initialValues={{
            kind: TransactionKind.TRANSFER,
            type: TransactionType.TRANSFER,
            toAccountId: payCardAccount.id,
            toAccount: payCardAccount.id,
            amount: Math.abs(payCardAccount.balance),
            notes: `Credit card bill payment for ${payCardAccount.name}`,
          }}
        />
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
