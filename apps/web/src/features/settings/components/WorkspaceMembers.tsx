"use client";

import React, { useState } from "react";
import { Button, Input, toast } from "@finai/ui";
import { useActiveWorkspace } from "@/hooks";
import { useWorkspaceMembers, useInviteMember } from "@/features/workspace/api";

export function WorkspaceMembers() {
  const { activeWorkspace } = useActiveWorkspace();
  const {
    data: members = [],
    isLoading,
    refetch,
  } = useWorkspaceMembers(activeWorkspace?.id || null);
  const inviteMutation = useInviteMember();

  const [email, setEmail] = useState("");

  const handleInvite = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error("Please enter an email");
      return;
    }
    if (!activeWorkspace?.id) return;

    try {
      await inviteMutation.mutateAsync({ workspaceId: activeWorkspace.id, email: targetEmail });
      toast.success("Invitation sent successfully!");
      setEmail("");
      refetch();
    } catch (err) {
      toast.error((err as Error).message || "Failed to send invitation");
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        No active workspace selected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-muted-foreground py-4 text-center text-sm">Loading members...</div>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.userId}
              className="border-border flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{m.user?.name || "Unknown User"}</p>
                <p className="text-muted-foreground text-xs">{m.user?.email}</p>
              </div>
              <span className="text-muted-foreground text-xs capitalize">
                {m.role.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="name@family.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
          {inviteMutation.isPending ? "Inviting..." : "Invite"}
        </Button>
      </div>
    </div>
  );
}
