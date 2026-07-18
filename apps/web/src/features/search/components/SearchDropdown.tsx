"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Receipt, Wallet, Target, SearchX } from "lucide-react";
import { MoneyDisplay, cn } from "@finai/ui";
import { useSearch } from "../api/useSearch";

interface SearchDropdownProps {
  workspaceId: string | null;
  query: string;
  onClose: () => void;
}

export function SearchDropdown({ workspaceId, query, onClose }: SearchDropdownProps) {
  const { data, isFetching } = useSearch(workspaceId, query);

  const hasResults =
    (data?.transactions?.length ?? 0) + (data?.accounts?.length ?? 0) + (data?.goals?.length ?? 0) >
    0;

  if (query.trim().length < 2) return null;

  return (
    <div
      className="border-border/60 bg-background/95 ring-border/40 absolute top-[calc(100%+8px)] right-0 left-0 z-50 max-h-[420px] overflow-y-auto rounded-xl border shadow-xl ring-1 backdrop-blur-md"
      role="listbox"
      aria-label="Search results"
    >
      {isFetching && !data && (
        <div className="space-y-2 p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!isFetching && !hasResults && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <SearchX className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {/* Transactions */}
      {(data?.transactions?.length ?? 0) > 0 && (
        <section className="p-2">
          <p className="text-muted-foreground mb-1 px-2 text-[10px] font-bold tracking-wider uppercase">
            Transactions
          </p>
          {data!.transactions.map((t) => (
            <Link
              key={t.id}
              href="/transactions"
              onClick={onClose}
              className="hover:bg-secondary flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
            >
              <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
                <Receipt className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-semibold">
                  {t.notes ?? t.categoryName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t.accountName} · {new Date(t.date).toLocaleDateString("en-IN")}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold",
                  t.type === "EXPENSE" ? "text-destructive" : "text-primary",
                )}
              >
                <MoneyDisplay value={t.amount} />
              </span>
            </Link>
          ))}
        </section>
      )}

      {/* Accounts */}
      {(data?.accounts?.length ?? 0) > 0 && (
        <section
          className={cn(
            "p-2",
            (data?.transactions?.length ?? 0) > 0 && "border-border/40 border-t",
          )}
        >
          <p className="text-muted-foreground mb-1 px-2 text-[10px] font-bold tracking-wider uppercase">
            Accounts
          </p>
          {data!.accounts.map((a) => (
            <Link
              key={a.id}
              href="/accounts"
              onClick={onClose}
              className="hover:bg-secondary flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
            >
              <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
                <Wallet className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-semibold">{a.name}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  {a.type.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <MoneyDisplay value={a.balance} className="shrink-0 text-sm font-semibold" />
            </Link>
          ))}
        </section>
      )}

      {/* Goals */}
      {(data?.goals?.length ?? 0) > 0 && (
        <section
          className={cn(
            "p-2",
            ((data?.transactions?.length ?? 0) > 0 || (data?.accounts?.length ?? 0) > 0) &&
              "border-border/40 border-t",
          )}
        >
          <p className="text-muted-foreground mb-1 px-2 text-[10px] font-bold tracking-wider uppercase">
            Goals
          </p>
          {data!.goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <Link
                key={g.id}
                href="/goals"
                onClick={onClose}
                className="hover:bg-secondary flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Target className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-semibold">{g.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="bg-border h-1 flex-1 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[10px]">{pct}%</span>
                  </div>
                </div>
                <ArrowRight className="text-muted-foreground size-3.5 shrink-0" />
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
