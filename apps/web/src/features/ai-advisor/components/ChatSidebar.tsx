"use client";

import { Trash2, MessageSquare } from "lucide-react";
import { ContentCard, MoneyDisplay } from "@finai/ui";
import type { AiConversation } from "../api/useConversations";
import type { DashboardStats } from "@/features/dashboard/api/getDashboardStats";
import type { InvestmentsResponse } from "@/features/investments/api/getInvestments";

const SUGGESTED_PROMPTS = [
  "Where did I overspend this month?",
  "Can I increase my SIP?",
  "Compare this month with last month",
  "Can we afford a vacation to Bali?",
  "How is our family budget performing?",
  "What should we improve next month?",
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
    <aside className="space-y-6">
      {/* Suggested prompts OR conversation history */}
      {showHistory ? (
        <ContentCard>
          <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
            Past Conversations
          </h3>
          {!conversations || conversations.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-xs">
              No saved conversations yet.
            </p>
          ) : (
            <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
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
                        <p className="truncate text-xs font-medium">{c.title || "Untitled Chat"}</p>
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
        </ContentCard>
      ) : (
        <ContentCard>
          <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
            Suggested Prompts
          </h3>
          <div className="flex flex-col gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => onPromptClick(p)}
                className="bg-secondary text-muted-foreground hover:bg-secondary/60 hover:text-foreground focus-visible:ring-ring cursor-pointer rounded-lg px-3 py-2 text-left text-xs transition outline-none focus-visible:ring-1"
              >
                {p}
              </button>
            ))}
          </div>
        </ContentCard>
      )}

      {/* Live stats */}
      <ContentCard>
        <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
          This Month at a Glance
        </h3>
        <ul className="space-y-3 text-sm">
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
                <MoneyDisplay value={value} className={className} />
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </li>
          ))}
        </ul>
      </ContentCard>
    </aside>
  );
}
