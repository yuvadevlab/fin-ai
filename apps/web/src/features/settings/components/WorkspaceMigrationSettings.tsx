"use client";

import React, { useState } from "react";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useCategories } from "@/features/categories";
import { useAccounts } from "@/features/accounts/api/getAccounts";
import { useMigrateRecords } from "@/features/workspace/api/migration";
import { Label, Button, toast } from "@finai/ui";

export function WorkspaceMigrationSettings() {
  const { workspaces, activeWorkspace } = useActiveWorkspace();
  const { data: accounts = [] } = useAccounts(activeWorkspace?.id || null);
  const { data: categories = [] } = useCategories(activeWorkspace?.id || null);

  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const migrateMutation = useMigrateRecords(activeWorkspace?.id || "");

  const targetOptions = (workspaces ?? []).filter((w) => w.id !== activeWorkspace?.id);

  const customCategories = categories.filter((c) => !c.isSystem);

  const handleToggleAccount = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleToggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleMigrate = async () => {
    if (!targetWorkspaceId) {
      toast.error("Please select a target workspace");
      return;
    }
    if (selectedAccounts.length === 0 && selectedCategories.length === 0) {
      toast.error("Please select at least one account or category to duplicate");
      return;
    }

    try {
      await migrateMutation.mutateAsync({
        targetWorkspaceId,
        accountIds: selectedAccounts,
        categoryIds: selectedCategories,
      });
      toast.success("Successfully duplicated selected records!");
      setSelectedAccounts([]);
      setSelectedCategories([]);
    } catch (err) {
      toast.error((err as Error).message || "Failed to duplicate records. Please try again.");
    }
  };

  if (targetOptions.length === 0) {
    return (
      <div className="text-muted-foreground py-6 text-center text-sm">
        You do not have any other workspaces to duplicate records to.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="target-workspace" className="text-sm font-medium">
          Target Workspace
        </Label>
        <select
          id="target-workspace"
          value={targetWorkspaceId}
          onChange={(e) => setTargetWorkspaceId(e.target.value)}
          className="bg-background border-border text-foreground focus:ring-primary w-full rounded-lg border p-2 text-sm focus:ring-1 focus:outline-none"
        >
          <option value="">Select target workspace...</option>
          {targetOptions.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.type === "PERSONAL" ? "Personal" : "Family"})
            </option>
          ))}
        </select>
      </div>

      {accounts.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Select Accounts to Duplicate</Label>
          <div className="border-border divide-border max-h-48 divide-y overflow-y-auto rounded-lg border">
            {accounts.map((acc) => (
              <label
                key={acc.id}
                className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedAccounts.includes(acc.id)}
                  onChange={() => handleToggleAccount(acc.id)}
                  className="border-border text-primary focus:ring-primary rounded"
                />
                <div className="flex-1">
                  <p className="text-foreground font-medium">{acc.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {acc.type} · ₹{acc.balance.toLocaleString("en-IN")}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {customCategories.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Select Custom Categories to Duplicate</Label>
          <div className="border-border divide-border max-h-48 divide-y overflow-y-auto rounded-lg border">
            {customCategories.map((cat) => (
              <label
                key={cat.id}
                className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleToggleCategory(cat.id)}
                  className="border-border text-primary focus:ring-primary rounded"
                />
                <div className="flex-1">
                  <p className="text-foreground font-medium">{cat.name}</p>
                  <p className="text-muted-foreground text-xs">Group: {cat.group}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {accounts.length === 0 && customCategories.length === 0 && (
        <div className="text-muted-foreground border-border rounded-lg border border-dashed py-4 text-center text-sm">
          No custom accounts or categories found in this workspace to duplicate.
        </div>
      )}

      <Button
        type="button"
        className="mt-4 w-full cursor-pointer"
        onClick={handleMigrate}
        disabled={migrateMutation.isPending}
      >
        {migrateMutation.isPending ? "Duplicating..." : "Duplicate Selected"}
      </Button>
    </div>
  );
}
