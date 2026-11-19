"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Receipt, Wallet, Target, SearchX } from "lucide-react";
import { cn } from "@fin-ai/ui";
import { PrivacyMoney } from "@/components";
import { TransactionType } from "@fin-ai/shared-types";
import { APP_ROUTES } from "@/lib";
import { UI_COPY } from "@/lib/ui-copy";
import { useSearch } from "../api";

interface SearchDropdownProps {
  query: string;
  onClose: () => void;
}

export function SearchDropdown({ query, onClose }: SearchDropdownProps) {
  const { data, isFetching } = useSearch(query);

  const hasResults =
    (data?.transactions?.length ?? 0) + (data?.accounts?.length ?? 0) + (data?.goals?.length ?? 0) >
    0;

  if (query.trim().length < 2) return null;

  return (
    <div className="fn-search-dropdown" role="listbox" aria-label={UI_COPY.SEARCH.RESULTS_LABEL}>
      {isFetching && !data && (
        <div className="fn-search-skeleton-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="fn-search-skeleton-item" />
          ))}
        </div>
      )}

      {!isFetching && !hasResults && (
        <div className="fn-search-empty-wrap">
          <SearchX className="fn-search-empty-icon" />
          <p className="fn-search-empty-text">{UI_COPY.SEARCH.NO_RESULTS(query)}</p>
        </div>
      )}

      {/* Transactions */}
      {(data?.transactions?.length ?? 0) > 0 && (
        <section className="fn-search-section">
          <p className="fn-search-section-title">{UI_COPY.SEARCH.TRANSACTIONS}</p>
          {data!.transactions.map((t) => (
            <Link
              key={t.id}
              href={APP_ROUTES.TRANSACTIONS}
              onClick={onClose}
              className="fn-search-item"
            >
              <span className="fn-search-icon-badge">
                <Receipt className="fn-icon-sm" />
              </span>
              <div className="fn-search-item-info">
                <p className="fn-search-item-title">{t.notes ?? t.categoryName}</p>
                <p className="fn-search-item-meta">
                  {t.accountName} · {new Date(t.date).toLocaleDateString("en-IN")}
                </p>
              </div>
              <span
                className={cn(
                  "fn-search-amount",
                  t.type === TransactionType.EXPENSE ? "is-expense" : "is-income",
                )}
              >
                <PrivacyMoney value={t.amount} />
              </span>
            </Link>
          ))}
        </section>
      )}

      {/* Accounts */}
      {(data?.accounts?.length ?? 0) > 0 && (
        <section
          className={cn("fn-search-section", (data?.transactions?.length ?? 0) > 0 && "has-border")}
        >
          <p className="fn-search-section-title">{UI_COPY.SEARCH.ACCOUNTS}</p>
          {data!.accounts.map((a) => (
            <Link
              key={a.id}
              href={APP_ROUTES.ACCOUNTS}
              onClick={onClose}
              className="fn-search-item"
            >
              <span className="fn-search-icon-badge">
                <Wallet className="fn-icon-sm" />
              </span>
              <div className="fn-search-item-info">
                <p className="fn-search-item-title">{a.name}</p>
                <p className="fn-search-item-meta is-capitalize">
                  {a.type.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <PrivacyMoney value={a.balance} className="fn-search-amount" />
            </Link>
          ))}
        </section>
      )}

      {/* Goals */}
      {(data?.goals?.length ?? 0) > 0 && (
        <section
          className={cn(
            "fn-search-section",
            ((data?.transactions?.length ?? 0) > 0 || (data?.accounts?.length ?? 0) > 0) &&
              "has-border",
          )}
        >
          <p className="fn-search-section-title">{UI_COPY.SEARCH.GOALS}</p>
          {data!.goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <Link key={g.id} href={APP_ROUTES.GOALS} onClick={onClose} className="fn-search-item">
                <span className="fn-search-icon-badge">
                  <Target className="fn-icon-sm" />
                </span>
                <div className="fn-search-item-info">
                  <p className="fn-search-item-title">{g.name}</p>
                  <div className="fn-search-goal-progress">
                    <div className="fn-search-goal-bar">
                      <div className="fn-search-goal-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="fn-search-goal-pct">{pct}%</span>
                  </div>
                </div>
                <ArrowRight className="fn-search-arrow-icon" />
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
