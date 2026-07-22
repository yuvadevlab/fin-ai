"use client";

import { usePendingInvites, useAcceptInvite, useRejectInvite } from "@/features/workspace/api";
import { Button, toast } from "@finai/ui";

export function PendingInvitesList() {
  const { data: pendingInvites, refetch: refetchPending } = usePendingInvites();
  const acceptInviteMutation = useAcceptInvite();
  const rejectInviteMutation = useRejectInvite();

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await acceptInviteMutation.mutateAsync(inviteId);
      toast.success("Joined workspace successfully!");
      refetchPending();
    } catch (err) {
      toast.error((err as Error).message || "Failed to accept invitation.");
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      await rejectInviteMutation.mutateAsync(inviteId);
      toast.success("Invitation rejected.");
      refetchPending();
    } catch (err) {
      toast.error((err as Error).message || "Failed to reject invitation.");
    }
  };

  if (!pendingInvites || pendingInvites.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {pendingInvites.map((invite) => (
        <div
          key={invite.id}
          className="border-primary/20 bg-primary/5 flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-foreground text-sm font-semibold">Workspace Invitation</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {invite.invitedBy?.name || invite.invitedBy?.email} has invited you to join the
              workspace{" "}
              <span className="text-foreground font-semibold">"{invite.workspace?.name}"</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 cursor-pointer text-xs"
              onClick={() => handleRejectInvite(invite.id)}
              disabled={rejectInviteMutation.isPending || acceptInviteMutation.isPending}
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="h-8 cursor-pointer text-xs"
              onClick={() => handleAcceptInvite(invite.id)}
              disabled={rejectInviteMutation.isPending || acceptInviteMutation.isPending}
            >
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
