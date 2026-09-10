"use client";

import { Landmark, PiggyBank, ListChecks } from "lucide-react";
import { cn } from "@finai/ui";
import { PrivacyMoney } from "@/components";
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
    accounts?.filter((a) => a.type !== "CREDIT_CARD").reduce((sum, a) => sum + a.balance, 0) ?? 0;
  const hasStats = stats !== undefined;
  const accountCount = accounts?.length ?? stats?.accountCount;
  const goalCount = stats?.goalCount;
  const budgetCount = budgets?.length;

  return (
    <div className="space-y-3">
      <SnapshotStat
        label="Cash available"
        value={cashAvailable}
        loading={!accounts}
        className="text-2xl"
      />
      <div className="bg-foreground/2 border-border/60 rounded-lg border px-3 py-2">
        <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
          This month
        </p>
        <div className="space-y-1">
          <SnapshotRow label="Income" value={stats?.monthlyIncome} hasData={hasStats} />
          <SnapshotRow label="Expenses" value={stats?.monthlyExpenses} hasData={hasStats} />
          <SnapshotRow
            label="Net cash flow"
            value={stats?.netCashFlow}
            hasData={hasStats}
            emphasis={stats ? (stats.netCashFlow >= 0 ? "positive" : "negative") : undefined}
          />
        </div>
      </div>
      <div className="bg-foreground/2 border-border/60 rounded-lg border px-3 py-2">
        <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
          Net worth
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
          Current context
        </p>
        <ul className="space-y-1.5 text-xs">
          <ContextCount icon={Landmark} label="Accounts" value={accountCount} />
          <ContextCount icon={ListChecks} label="Budgets" value={budgetCount} />
          <ContextCount icon={PiggyBank} label="Goals" value={goalCount} />
        </ul>
        {accounts && (
          <p className="text-muted-foreground border-border/50 mt-2 border-t pt-1.5 text-[11px]">
            Default account:{" "}
            <span className="text-foreground font-medium">
              {accounts.find((a) => a.isDefault)?.name ?? "None set"}
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
