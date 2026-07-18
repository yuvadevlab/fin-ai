"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PageContainer,
  PageHeader,
  DashboardTabs,
  KPIGrid,
  StatCard,
  ContentCard,
  SectionHeader,
  MoneyDisplay,
  CashFlowChart,
  CategoryPie,
  TrendLine,
  CHART_COLORS,
  Input,
  Button,
  toast,
} from "@finai/ui";
import { LiveAIInsightCard } from "@/features/ai-advisor/components";
import { useDashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { useMonthlyAnalytics } from "@/features/dashboard/api/getMonthlyAnalytics";
import { useCategoryBreakdown } from "@/features/dashboard/api/getCategoryBreakdown";
import { useSavingsTrend } from "@/features/dashboard/api/getSavingsTrend";
import { useWorkspace } from "@/providers";
import { FEATURE_FLAGS } from "@/lib/app-constants";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useWorkspaceMembers, useInviteMember, useRemoveMember } from "@/features/workspace/api";
import { useState } from "react";
import { UserPlus, Trash2, Mail, Users } from "lucide-react";

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("finai_user");
    if (!raw) return null;
    const user = JSON.parse(raw) as { id?: string };
    return user.id ?? null;
  } catch {
    return null;
  }
}

export function FamilyPage() {
  const pathname = usePathname();
  const { workspaceId } = useWorkspace();
  const { activeWorkspace } = useActiveWorkspace();
  const currentUserId = getCurrentUserId();

  const { data: members, refetch: refetchMembers } = useWorkspaceMembers(workspaceId);
  const inviteMutation = useInviteMember();
  const removeMutation = useRemoveMember();

  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: stats } = useDashboardStats(workspaceId);
  const { data: rawMonthlyCashFlow } = useMonthlyAnalytics(workspaceId);
  const { data: rawCategoryBreakdown } = useCategoryBreakdown(workspaceId);
  const { data: rawSavingsTrend } = useSavingsTrend(workspaceId);

  const monthlyCashFlow = useMemo(
    () => (Array.isArray(rawMonthlyCashFlow) ? rawMonthlyCashFlow : []),
    [rawMonthlyCashFlow],
  );

  const categoryBreakdown = useMemo(
    () => (Array.isArray(rawCategoryBreakdown) ? rawCategoryBreakdown : []),
    [rawCategoryBreakdown],
  );

  const savingsTrend = useMemo(
    () => (Array.isArray(rawSavingsTrend) ? rawSavingsTrend : []),
    [rawSavingsTrend],
  );

  // Shared budget usage — ratio of expenses to income (as %)
  const sharedBudgetPct = useMemo(() => {
    const income = stats?.monthlyIncome ?? 0;
    const expenses = stats?.monthlyExpenses ?? 0;
    if (income <= 0) return 0;
    return Math.min(100, Math.round((expenses / income) * 100));
  }, [stats]);

  const netSaved = (stats?.monthlyIncome ?? 0) - (stats?.monthlyExpenses ?? 0);

  const incomeChange =
    stats && stats.lastMonthIncome > 0
      ? (((stats.monthlyIncome - stats.lastMonthIncome) / stats.lastMonthIncome) * 100).toFixed(1)
      : null;

  const expenseChange =
    stats && stats.lastMonthExpenses > 0
      ? (
          ((stats.monthlyExpenses - stats.lastMonthExpenses) / stats.lastMonthExpenses) *
          100
        ).toFixed(1)
      : null;

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email || !workspaceId) return;

    setIsSubmitting(true);
    inviteMutation.mutate(
      { workspaceId, email },
      {
        onSuccess: (data) => {
          const res = data as { message?: string } | undefined;
          toast.success(res?.message || "Invitation successful!");
          setInviteEmail("");
          refetchMembers();
        },
        onError: (err) => {
          const apiError = err as { response?: { data?: { message?: string } } } | undefined;
          toast.error(
            apiError?.response?.data?.message ||
              "Failed to invite member. Make sure they are registered.",
          );
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!workspaceId) return;

    if (window.confirm("Are you sure you want to remove this member from the workspace?")) {
      removeMutation.mutate(
        { workspaceId, memberId },
        {
          onSuccess: () => {
            toast.success("Member removed successfully");
            refetchMembers();
          },
          onError: (err) => {
            const apiError = err as { response?: { data?: { message?: string } } } | undefined;
            toast.error(apiError?.response?.data?.message || "Failed to remove member");
          },
        },
      );
    }
  };

  const customLink = useCallback(
    ({
      href,
      children,
      className,
    }: {
      href: string;
      children: React.ReactNode;
      className?: string;
    }) => (
      <Link href={href} className={className}>
        {children}
      </Link>
    ),
    [],
  );

  const isFamilyWorkspace = activeWorkspace?.type === "FAMILY";

  return (
    <PageContainer>
      <PageHeader
        title="Family Finance"
        description="Shared spending, bills, and goals across your family workspace."
      />

      <DashboardTabs pathname={pathname} LinkComponent={customLink} />

      <KPIGrid>
        <StatCard
          label="Combined Income"
          value={<MoneyDisplay value={stats?.monthlyIncome ?? 0} />}
          trend={
            incomeChange !== null
              ? {
                  value: `${Number(incomeChange) >= 0 ? "+" : ""}${incomeChange}%`,
                  kind: Number(incomeChange) >= 0 ? "up" : "down",
                }
              : undefined
          }
        />
        <StatCard
          label="Combined Expenses"
          value={<MoneyDisplay value={stats?.monthlyExpenses ?? 0} />}
          trend={
            expenseChange !== null
              ? {
                  value: `${Number(expenseChange) >= 0 ? "+" : ""}${expenseChange}%`,
                  kind: Number(expenseChange) > 0 ? "down" : "up",
                }
              : undefined
          }
          hint="vs last month"
        />
        <StatCard
          label="Family Savings"
          value={<MoneyDisplay value={netSaved} />}
          trend={{
            value: `${stats?.savingsRate?.toFixed(1) ?? 0}% savings rate`,
            kind: (stats?.savingsRate ?? 0) > 30 ? "up" : "flat",
          }}
        />
        <StatCard
          label="Shared Budget"
          value={`${sharedBudgetPct}%`}
          hint="of monthly income spent"
        >
          <div className="bg-border/60 ml-auto h-1 w-24 overflow-hidden rounded-full">
            <div className="bg-primary h-full" style={{ width: `${sharedBudgetPct}%` }} />
          </div>
        </StatCard>
      </KPIGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ContentCard>
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader title="Family Cash Flow" className="mb-0" />
              <span className="text-muted-foreground text-xs">Last 6 months</span>
            </div>
            <CashFlowChart data={monthlyCashFlow} />
          </ContentCard>

          <ContentCard>
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader title="Family Savings Trend" className="mb-0" />
              <span className="text-muted-foreground text-xs">Monthly net savings</span>
            </div>
            <TrendLine data={savingsTrend} />
          </ContentCard>

          {/* Workspace Members section */}
          <ContentCard>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <SectionHeader title="Family Members" className="mb-0" />
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {isFamilyWorkspace
                    ? "Manage who can view and add transactions to this family account."
                    : "You are currently in your Personal Workspace. Switch to a Family workspace to invite members."}
                </p>
              </div>

              {isFamilyWorkspace && (
                <form onSubmit={handleInviteSubmit} className="flex items-center gap-2">
                  <div className="relative">
                    <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                    <Input
                      type="email"
                      placeholder="Family email..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="h-8 w-48 pl-9 text-xs"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !inviteEmail}
                    className="h-8 gap-1 text-xs"
                  >
                    <UserPlus className="size-3.5" /> Invite
                  </Button>
                </form>
              )}
            </div>

            {isFamilyWorkspace ? (
              <div className="divide-border/60 mt-6 divide-y">
                {members?.map((m) => {
                  const isSelf = m.userId === currentUserId;
                  const isOwner = m.role === "OWNER";
                  return (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-semibold">
                          {m.user?.name ? (
                            m.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          ) : (
                            <Users className="size-4" />
                          )}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-sm font-semibold">
                            {m.user?.name || "Unknown User"}
                            {isSelf && (
                              <span className="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-normal">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-muted-foreground text-xs">{m.user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ring-1 ${
                            isOwner
                              ? "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20"
                              : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                          }`}
                        >
                          {m.role}
                        </span>

                        {!isSelf && !isOwner && activeWorkspace?.ownerId === currentUserId && (
                          <button
                            onClick={() => handleRemoveMember(m.userId)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-border/80 mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <Users className="text-muted-foreground mb-3 size-8 opacity-40" />
                <p className="text-foreground text-sm font-semibold">Switch to Family Workspace</p>
                <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                  To view, invite, or collaborate with members, choose your Family Workspace from
                  the workspace switcher dropdown in the top bar.
                </p>
              </div>
            )}
          </ContentCard>
        </div>

        <div className="space-y-6">
          {FEATURE_FLAGS.AI_INSIGHT && (
            <LiveAIInsightCard page="family" variant="light" cta="View Family Goals" />
          )}

          <ContentCard>
            <SectionHeader title="Shared Category Spending" />
            <CategoryPie data={categoryBreakdown.map((c) => ({ name: c.name, value: c.total }))} />
            <ul className="mt-4 space-y-2 text-sm">
              {categoryBreakdown.slice(0, 4).map((c, i) => (
                <li key={c.categoryId ?? c.name} className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <span
                      className="size-2 animate-pulse rounded-full"
                      style={{
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    {c.name}
                  </span>
                  <span className="font-semibold">
                    <MoneyDisplay value={c.total} />
                  </span>
                </li>
              ))}
            </ul>
          </ContentCard>

          {/* Net Worth mini card */}
          <ContentCard>
            <SectionHeader title="Family Net Worth" />
            <div className="mt-2">
              <p className="text-foreground text-2xl font-bold">
                <MoneyDisplay value={stats?.netWorth ?? 0} />
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {stats?.accountCount ?? 0} accounts + investments
              </p>
            </div>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  );
}
