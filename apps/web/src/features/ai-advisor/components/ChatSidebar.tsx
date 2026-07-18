"use client";

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

interface ChatSidebarProps {
  showHistory: boolean;
  conversations: AiConversation[] | undefined;
  stats: DashboardStats | undefined;
  investments: InvestmentsResponse | undefined;
  onPromptClick: (prompt: string) => void;
  onConversationClick: (convo: AiConversation) => void;
}

export function ChatSidebar({
  showHistory,
  conversations,
  stats,
  investments,
  onPromptClick,
  onConversationClick,
}: ChatSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Suggested prompts OR conversation history */}
      {showHistory ? (
        <ContentCard>
          <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
            Past conversations
          </h3>
          {!conversations || conversations.length === 0 ? (
            <p className="text-muted-foreground text-xs">No conversations yet.</p>
          ) : (
            <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onConversationClick(c)}
                  className="bg-secondary text-muted-foreground hover:bg-secondary/60 hover:text-foreground cursor-pointer truncate rounded-lg px-3 py-2 text-left text-xs transition outline-none"
                >
                  {c.title || "Untitled conversation"}
                </button>
              ))}
            </div>
          )}
        </ContentCard>
      ) : (
        <ContentCard>
          <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
            Suggested prompts
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
          This month at a glance
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
