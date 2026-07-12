"use client";

import React from "react";
import { Send, Sparkles } from "lucide-react";
import { PageContainer, PageHeader, Button, Input, MoneyDisplay, ContentCard } from "@finai/ui";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  "Where did I overspend this month?",
  "Can I increase my SIP?",
  "Compare this month with last month",
  "Can we afford a vacation to Bali?",
  "How is our family budget performing?",
  "What should we improve next month?",
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  card?: {
    title: string;
    rows: [string, string][];
  };
}

export default function AiAdvisorPage() {
  const [conversation, setConversation] = React.useState<ChatMessage[]>([
    { role: "user", text: "Where did I overspend this month?" },
    {
      role: "assistant",
      text: "You went over budget in two categories in March. Dining is your biggest overshoot — mostly weekend food delivery.",
      card: {
        title: "Categories over budget",
        rows: [
          ["Entertainment", "₹800 over"],
          ["Food & Dining", "₹1,400 over"],
        ],
      },
    },
    { role: "user", text: "Can we afford a vacation to Bali?" },
    {
      role: "assistant",
      text: "At your current savings rate, adding ₹18,000/month for 4 months covers a ₹72,000 trip while keeping your emergency fund intact.",
    },
  ]);
  const [input, setInput] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...conversation, { role: "user", text: input } as ChatMessage];
    setConversation(newMsgs);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I've analyzed your financial snapshot. Let me know if you would like me to build a savings projection for this.",
        },
      ]);
    }, 1000);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <PageContainer>
      <PageHeader
        title="AI Advisor"
        description="Ask anything about your money. FinAI grounds answers in your accounts, budgets, and goals."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="bg-card ring-border/50 flex h-[70vh] flex-col overflow-hidden rounded-2xl shadow-sm ring-1">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {conversation.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "animate-in slide-in-from-bottom-2 flex gap-3 duration-200",
                  m.role === "user" && "flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm",
                    m.role === "assistant"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {m.role === "assistant" ? <Sparkles className="size-4 animate-pulse" /> : "AS"}
                </div>
                <div
                  className={cn(
                    "max-w-xl space-y-3 rounded-2xl px-4 py-3 text-sm shadow-sm",
                    m.role === "assistant"
                      ? "bg-secondary text-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  {m.card && (
                    <div className="bg-card ring-border/60 rounded-xl p-3 ring-1">
                      <p className="text-foreground mb-2 text-xs font-bold">{m.card.title}</p>
                      <ul className="space-y-1.5">
                        {m.card.rows.map(([k, v]) => (
                          <li
                            key={k}
                            className="text-foreground flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground">{k}</span>
                            <span className="text-destructive font-semibold">{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-border/80 bg-secondary/10 border-t p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                placeholder="Ask about your finances…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-background flex-1"
              />
              <Button type="submit" size="icon" className="shrink-0 cursor-pointer rounded-lg">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>

        <aside className="space-y-6">
          <ContentCard>
            <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Suggested prompts
            </h3>
            <div className="flex flex-col gap-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePromptClick(p)}
                  className="bg-secondary text-muted-foreground hover:bg-secondary/60 hover:text-foreground focus-visible:ring-ring cursor-pointer rounded-lg px-3 py-2 text-left text-xs transition outline-none focus-visible:ring-1"
                >
                  {p}
                </button>
              ))}
            </div>
          </ContentCard>

          <ContentCard>
            <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              This month at a glance
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Income</span>
                <MoneyDisplay value={125000} />
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Expenses</span>
                <MoneyDisplay value={48200} />
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Saved</span>
                <MoneyDisplay value={76800} className="text-primary font-bold" />
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Investments</span>
                <MoneyDisplay value={1135000} />
              </li>
            </ul>
          </ContentCard>
        </aside>
      </div>
    </PageContainer>
  );
}
