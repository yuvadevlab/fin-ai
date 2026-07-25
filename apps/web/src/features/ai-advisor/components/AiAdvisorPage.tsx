"use client";

import { useState } from "react";
import { History, MessageSquarePlus } from "lucide-react";
import { PageContainer, PageHeader, Button } from "@finai/ui";
import { useWorkspace } from "@/providers";
import { useAiChat } from "../api/useAiChat";
import { useConversations, useDeleteConversation } from "../api/useConversations";
import { useDashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { useInvestments } from "@/features/investments/api/getInvestments";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatSidebar } from "./ChatSidebar";

export function AiAdvisorPage() {
  const { workspaceId } = useWorkspace();
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    stopStreaming,
    startNewConversation,
    loadConversation,
  } = useAiChat({ workspaceId });

  const { data: conversations } = useConversations(workspaceId);
  const deleteConversationMutation = useDeleteConversation(workspaceId);

  const { data: stats } = useDashboardStats(workspaceId);
  const { data: investments } = useInvestments(workspaceId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    await sendMessage(q);
  };

  const handleFollowUpClick = async (question: string) => {
    if (isStreaming) return;
    await sendMessage(question);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversationMutation.mutateAsync(id);
    if (conversationId === id) {
      startNewConversation();
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="AI Advisor"
        description="Ask anything about your money. FinAI grounds answers in your real accounts, budgets, and goals."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showHistory ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHistory((v) => !v)}
              className="cursor-pointer gap-1.5"
            >
              <History className="size-3.5" />
              {showHistory ? "Hide History" : "Chat History"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                startNewConversation();
                setShowHistory(false);
              }}
              className="cursor-pointer gap-1.5"
              disabled={messages.length === 0 && !conversationId}
            >
              <MessageSquarePlus className="size-3.5" />
              New Chat
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Chat panel */}
        <div className="bg-card ring-border/50 flex h-[72vh] flex-col overflow-hidden rounded-2xl shadow-sm ring-1">
          <div className="flex-1 overflow-y-auto p-6">
            <ChatMessages messages={messages} onSelectFollowUp={handleFollowUpClick} />
          </div>
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isStreaming={isStreaming}
            onStop={stopStreaming}
          />
        </div>

        {/* Sidebar */}
        <ChatSidebar
          showHistory={showHistory}
          activeConversationId={conversationId}
          conversations={conversations}
          stats={stats}
          investments={investments}
          onPromptClick={(p) => setInput(p)}
          onConversationClick={(c) => {
            loadConversation(c);
            setShowHistory(false);
          }}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>
    </PageContainer>
  );
}
