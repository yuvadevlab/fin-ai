"use client";

import { Landmark, PiggyBank, ListChecks } from "lucide-react";
import { cn } from "@fin-ai/ui";
import { AccountType } from "@fin-ai/shared-types";
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
    <div className="fn-snapshot">
      <SnapshotStat
        label={UI_COPY.ADVISOR.SNAPSHOT.CASH_AVAILABLE}
        value={cashAvailable}
        loading={!accounts}
        className="fn-snapshot-stat-val"
      />
      <div className="fn-snapshot-card">
        <p className="fn-snapshot-card-title">{UI_COPY.ADVISOR.SNAPSHOT.THIS_MONTH}</p>
        <div className="fn-snapshot-rows">
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
      <div className="fn-snapshot-card">
        <p className="fn-snapshot-card-title">{UI_COPY.ADVISOR.SNAPSHOT.NET_WORTH}</p>
        {hasStats ? (
          <PrivacyMoney value={stats?.netWorth ?? 0} className="fn-snapshot-net-worth" />
        ) : (
          <div className="fn-snapshot-pulse-md" aria-hidden="true" />
        )}
      </div>

      {/* Current context counts */}
      <div className="fn-snapshot-card">
        <p className="fn-snapshot-card-title">{UI_COPY.ADVISOR.SNAPSHOT.CURRENT_CONTEXT}</p>
        <ul className="fn-snapshot-context-list">
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
          <p className="fn-snapshot-default-account">
            {UI_COPY.ADVISOR.SNAPSHOT.DEFAULT_ACCOUNT}{" "}
            <span className="fn-snapshot-default-name">
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
      <p className="fn-snapshot-card-title">{label}</p>
      {loading ? (
        <div className="fn-snapshot-pulse-lg" aria-hidden="true" />
      ) : (
        <PrivacyMoney value={value} className={cn("fn-snapshot-row-val", className)} />
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
    <div className="fn-snapshot-row">
      <span className="fn-snapshot-row-label">{label}</span>
      {hasData ? (
        <PrivacyMoney
          value={value ?? 0}
          showSign={emphasis !== undefined}
          className={cn(
            "fn-snapshot-row-val",
            emphasis === "negative" && "is-negative",
            emphasis === "positive" && "is-positive",
          )}
        />
      ) : (
        <span className="fn-snapshot-empty-val">—</span>
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
    <li className="fn-snapshot-context-item">
      <span className="fn-snapshot-context-label">
        <Icon className="fn-snapshot-context-icon" aria-hidden="true" />
        {label}
      </span>
      {value !== undefined ? (
        <span className="fn-snapshot-context-val">{value}</span>
      ) : (
        <span className="fn-snapshot-empty-val">—</span>
      )}
    </li>
  );
}
