"use client";

import { Landmark, PiggyBank, ListChecks } from "lucide-react";
import { cn } from "@finai/ui";
import { AccountType } from "@finai/shared-types";
import { PrivacyMoney } from "@/components";
import { UI_COPY } from "@/lib";
import { useAccounts } from "@/features/accounts/api/getAccounts";
import { useBudgets } from "@/features/budgets/api/getBudgets";
import { useDashboardStats } from "@/features/dashboard/api/getDashboardStats";

/**
 * "Financial Snapshot" — the user's money at a glance, all derived from real
 * existing API data (never fabricated):
 *
 * - Cash available = sum of non-credit account balances (liquid money).
 * - Income / Expenses from the dashboard analytics endpoint.
 * - Net worth from the dashboard analytics endpoint.
 *
 * Every value hides gracefully (—) until its real data loads.
 */
export function FinancialSnapshot() {
  const { data: stats } = useDashboardStats();
  const { data: accounts } = useAccounts();
  const { data: budgets } = useBudgets();

  const cashAvailable =
    accounts
      ?.filter((a) => a.type !== AccountType.CREDIT_CARD)
      .reduce((sum, a) => sum + a.balance, 0) ?? 0;
  const hasStats = stats !== undefined;
  const accountCount = accounts?.length ?? stats?.accountCount;
  const goalCount = stats?.goalCount;
  const budgetCount = budgets?.length;

  return (
    <div className="space-y-3">
      <SnapshotStat
        label={UI_COPY.ADVISOR.SNAPSHOT.CASH_AVAILABLE}
        value={cashAvailable}
        loading={!accounts}
        className="text-2xl"
      />
      <div className="bg-foreground/2 border-border/60 rounded-lg border px-3 py-2">
        <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
          {UI_COPY.ADVISOR.SNAPSHOT.THIS_MONTH}
        </p>
        <div className="space-y-1">
          <SnapshotRow
            label={UI_COPY.ADVISOR.SNAPSHOT.INCOME}
            value={stats?.monthlyIncome}
            hasData={hasStats}
          />
          <SnapshotRow
            label={UI_COPY.ADVISOR.SNAPSHOT.EXPENSES}
            value={stats?.monthlyExpenses}
            hasData={hasStats}
          />
          <SnapshotRow
            label={UI_COPY.ADVISOR.SNAPSHOT.NET_CASH_FLOW}
            value={stats?.netCashFlow}
            hasData={hasStats}
            emphasis={stats ? (stats.netCashFlow >= 0 ? "positive" : "negative") : undefined}
          />
        </div>
      </div>
      <div className="bg-foreground/2 border-border/60 rounded-lg border px-3 py-2">
        <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
          {UI_COPY.ADVISOR.SNAPSHOT.NET_WORTH}
        </p>
        {hasStats ? (
          <PrivacyMoney value={stats?.netWorth ?? 0} className="text-foreground text-lg" />
        ) : (
          <div
            className="bg-foreground/10 mt-1 h-6 w-28 animate-pulse rounded-md"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Current context counts */}
      <div className="bg-foreground/2 border-border/60 rounded-lg border px-3 py-2">
        <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
          {UI_COPY.ADVISOR.SNAPSHOT.CURRENT_CONTEXT}
        </p>
        <ul className="space-y-1.5 text-xs">
          <ContextCount
            icon={Landmark}
            label={UI_COPY.ADVISOR.SNAPSHOT.ACCOUNTS}
            value={accountCount}
          />
          <ContextCount
            icon={ListChecks}
            label={UI_COPY.ADVISOR.SNAPSHOT.BUDGETS}
            value={budgetCount}
          />
          <ContextCount icon={PiggyBank} label={UI_COPY.ADVISOR.SNAPSHOT.GOALS} value={goalCount} />
        </ul>
        {accounts && (
          <p className="text-muted-foreground border-border/50 mt-2 border-t pt-1.5 text-[11px]">
            {UI_COPY.ADVISOR.SNAPSHOT.DEFAULT_ACCOUNT}{" "}
            <span className="text-foreground font-medium">
              {accounts.find((a) => a.isDefault)?.name ?? UI_COPY.ADVISOR.SNAPSHOT.NONE_SET}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function SnapshotStat({
  label,
  value,
  loading,
  className,
}: {
  label: string;
  value: number;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
        {label}
      </p>
      {loading ? (
        <div
          className="bg-foreground/10 mt-1 h-7 w-28 animate-pulse rounded-md"
          aria-hidden="true"
        />
      ) : (
        <PrivacyMoney value={value} className={cn("text-foreground", className)} />
      )}
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  hasData,
  emphasis,
}: {
  label: string;
  value: number | undefined;
  hasData: boolean;
  emphasis?: "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      {hasData ? (
        <PrivacyMoney
          value={value ?? 0}
          showSign={emphasis !== undefined}
          className={cn(
            "text-xs",
            emphasis === "negative" && "text-destructive",
            emphasis === "positive" && "text-primary",
          )}
        />
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </div>
  );
}

function ContextCount({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Landmark;
  label: string;
  value: number | undefined;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground inline-flex items-center gap-1.5">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      {value !== undefined ? (
        <span className="text-foreground font-semibold tabular-nums">{value}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </li>
  );
}
