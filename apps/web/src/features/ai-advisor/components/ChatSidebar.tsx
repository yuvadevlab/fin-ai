"use client";

import { Trash2, MessageSquare } from "lucide-react";
import { PrivacyMoney } from "@/components";
import type { DashboardStats } from "@/features/dashboard/api/getDashboardStats";
import type { InvestmentsResponse } from "@/features/investments/api/getInvestments";
import type { AiConversation } from "../api";

const PROMPT_GROUPS = [
  {
    title: "Spending & Cash Flow",
    prompts: [
      "Where did I spend the most money this month?",
      "Analyze my top expense categories and flag unusual spikes",
      "Calculate my current savings rate (income vs expenses)",
    ],
  },
  {
    title: "Budgets & Optimization",
    prompts: [
      "Which of my budgets are at risk of exceeding limits?",
      "How can I trim 10% from my non-essential spending?",
      "Suggest a realistic monthly budget allocation for me",
    ],
  },
  {
    title: "Goals & Portfolio",
    prompts: [
      "Am I on track to hit my upcoming savings goal deadlines?",
      "How can I accelerate building my emergency fund?",
      "Evaluate my investment portfolio allocation across asset classes",
    ],
  },
];

function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? "min" : "mins"} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

interface ChatSidebarProps {
  showHistory: boolean;
  activeConversationId?: string | null;
  conversations: AiConversation[] | undefined;
  stats: DashboardStats | undefined;
  investments: InvestmentsResponse | undefined;
  onPromptClick: (prompt: string) => void;
  onConversationClick: (convo: AiConversation) => void;
  onDeleteConversation?: (id: string, e: React.MouseEvent) => void;
}

export function ChatSidebar({
  showHistory,
  activeConversationId,
  conversations,
  stats,
  investments,
  onPromptClick,
  onConversationClick,
  onDeleteConversation,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Top card: Suggested prompts OR conversation history — flex-1 with scroll */}
      <div className="bg-card border-border/70 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border p-4 shadow-sm">
        {showHistory ? (
          <>
            <h3 className="text-muted-foreground mb-3 shrink-0 text-xs font-bold tracking-wider uppercase">
              Past Conversations
            </h3>
            {!conversations || conversations.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-xs">
                No saved conversations yet.
              </p>
            ) : (
              <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                {conversations.map((c) => {
                  const isActive = c.id === activeConversationId;
                  const formattedDate = formatRelativeTime(c.updatedAt || c.createdAt);

                  return (
                    <div
                      key={c.id}
                      onClick={() => onConversationClick(c)}
                      className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs transition ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <MessageSquare className="size-3.5 shrink-0 opacity-70" />
                        <div className="truncate">
                          <p className="truncate text-xs font-medium">
                            {c.title || "Untitled Chat"}
                          </p>
                          <p className="text-[10px] opacity-75">{formattedDate}</p>
                        </div>
                      </div>
                      {onDeleteConversation && (
                        <button
                          onClick={(e) => onDeleteConversation(c.id, e)}
                          title="Delete chat"
                          className="hover:text-destructive p-1 opacity-0 transition group-hover:opacity-100"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-muted-foreground mb-2 shrink-0 text-xs font-bold tracking-wider uppercase">
              Suggested Inquiries
            </h3>
            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
              {PROMPT_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1.5">
                  <p className="text-muted-foreground/80 px-1 text-[10px] font-semibold tracking-wider uppercase">
                    {group.title}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {group.prompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => onPromptClick(p)}
                        className="bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-xs transition outline-none focus-visible:ring-1"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom card: This Month at a Glance — compact & docked */}
      <div className="bg-card border-border/70 shrink-0 rounded-2xl border p-4 shadow-sm">
        <h3 className="text-muted-foreground mb-2.5 text-xs font-bold tracking-wider uppercase">
          This Month at a Glance
        </h3>
        <ul className="space-y-2 text-xs">
          {(
            [
              { label: "Income", value: stats?.monthlyIncome },
              { label: "Expenses", value: stats?.monthlyExpenses },
              {
                label: "Net cash flow",
                value: stats?.netCashFlow,
                className:
                  stats !== undefined
                    ? stats.netCashFlow >= 0
                      ? "text-primary font-bold"
                      : "text-destructive font-bold"
                    : undefined,
              },
              { label: "Net worth", value: stats?.netWorth, className: "font-semibold" },
              { label: "Investments", value: investments?.totalValue },
            ] as { label: string; value: number | undefined; className?: string }[]
          ).map(({ label, value, className }) => (
            <li key={label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{label}</span>
              {value !== undefined ? (
                <PrivacyMoney value={value} className={className} />
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
