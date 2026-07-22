"use client";

import React from "react";
import { Button, toast } from "@finai/ui";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useAccounts } from "@/features/accounts/api/getAccounts";

export function AccountSettingsList() {
  const { activeWorkspace } = useActiveWorkspace();
  const { data: accounts = [], isLoading } = useAccounts(activeWorkspace?.id || null);

  const handleSync = (name: string) => {
    toast.success(`${name} synced successfully!`);
  };

  if (!activeWorkspace) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        No active workspace selected
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">Loading accounts...</div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-muted-foreground border-border rounded-lg border border-dashed py-4 text-center text-sm">
        No accounts linked in this workspace.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {accounts.map((a) => (
        <li
          key={a.id}
          className="border-border flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="text-sm font-medium">{a.name}</p>
            <p className="text-muted-foreground text-xs">
              {a.type} · ₹{a.balance.toLocaleString("en-IN")}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="cursor-pointer"
            onClick={() => handleSync(a.name)}
          >
            Sync
          </Button>
        </li>
      ))}
    </ul>
  );
}
