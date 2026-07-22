"use client";

import React, { useState } from "react";
import {
  useWorkspaceMembers,
  useInviteMember,
  useRemoveMember,
  useWorkspaceInvites,
} from "@/features/workspace/api";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { ContentCard, SectionHeader, Input, Button, toast } from "@finai/ui";
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

interface FamilyMembersSectionProps {
  workspaceId: string;
}

export function FamilyMembersSection({ workspaceId }: FamilyMembersSectionProps) {
  const { activeWorkspace } = useActiveWorkspace();
  const currentUserId = getCurrentUserId();

  const { data: members, refetch: refetchMembers } = useWorkspaceMembers(workspaceId);
  const { data: sentInvites, refetch: refetchSentInvites } = useWorkspaceInvites(workspaceId);

  const inviteMutation = useInviteMember();
  const removeMutation = useRemoveMember();

  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          refetchSentInvites();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to invite member. Make sure they are registered.");
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
            toast.error(err.message || "Failed to remove member");
          },
        },
      );
    }
  };

  const isFamilyWorkspace = activeWorkspace?.type === "FAMILY";

  return (
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

          {sentInvites?.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between py-3 opacity-60 transition-opacity hover:opacity-100"
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full text-xs font-semibold">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-semibold">
                    {invite.email}
                  </p>
                  <p className="text-muted-foreground text-xs">Invited by you · Pending</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="bg-muted text-muted-foreground ring-border rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ring-1">
                  PENDING
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-border/80 mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <Users className="text-muted-foreground mb-3 size-8 opacity-40" />
          <p className="text-foreground text-sm font-semibold">Switch to Family Workspace</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            To view, invite, or collaborate with members, choose your Family Workspace from the
            workspace switcher dropdown in the top bar.
          </p>
        </div>
      )}
    </ContentCard>
  );
}
