"use client";

import React, { useState, useMemo } from "react";
import { Lock, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { PageContainer, PageHeader, Button, ConfirmDialog } from "@finai/ui";
import { useActiveWorkspace } from "@/hooks";
import { Category, useCategories, useDeleteCategory } from "../api";
import { CategoryDialog } from "./CategoryDialog";

export function CategoriesPage() {
  const { activeWorkspaceId } = useActiveWorkspace();
  const { data: categories = [], isLoading } = useCategories(activeWorkspaceId);
  const deleteCategory = useDeleteCategory(activeWorkspaceId);

  // Add/Edit modal trigger state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Group Categories
  const groupedCategories = useMemo(() => {
    const groups: Record<string, Category[]> = {
      Income: [],
      "Fixed Expenses": [],
      "Variable Expenses": [],
      "Savings & Investments": [],
    };

    categories.forEach((cat) => {
      const grp = cat.group || "Variable Expenses";
      if (!groups[grp]) {
        groups[grp] = [];
      }
      groups[grp].push(cat);
    });

    return groups;
  }, [categories]);

  const handleOpenAdd = () => {
    setFormMode("add");
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setFormMode("edit");
    setSelectedCategory(cat);
    setFormOpen(true);
  };

  const handleOpenDelete = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory.mutateAsync(categoryToDelete.id);
      setDeleteOpen(false);
      setCategoryToDelete(null);
    } catch {
      // Handled by mutation onError
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Manage system default and workspace-specific categories for transactions and budgets."
        actions={
          <Button size="sm" onClick={handleOpenAdd} className="cursor-pointer gap-1.5">
            <Plus className="size-4" /> Add Category
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="text-primary size-8 animate-spin" />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {Object.entries(groupedCategories).map(([group, cats]) => {
            if (cats.length === 0) return null;

            return (
              <div key={group} className="space-y-4">
                <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase opacity-85">
                  {group}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cats.map((cat) => {
                    return (
                      <div
                        key={cat.id}
                        className="bg-card border-border hover:border-primary/20 flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="bg-secondary flex size-10 items-center justify-center rounded-xl text-xl">
                            {cat.icon || "🏷️"}
                          </div>

                          <div>
                            <p className="text-sm font-semibold">{cat.name}</p>

                            {cat.isSystem ? (
                              <span className="text-muted-foreground/80 mt-0.5 flex items-center gap-1 text-[10px]">
                                <Lock className="size-3" />
                                System Default
                              </span>
                            ) : (
                              <span className="text-primary/80 mt-0.5 text-[10px]">
                                Workspace Custom
                              </span>
                            )}
                          </div>
                        </div>

                        {!cat.isSystem && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
                              onClick={() => handleOpenEdit(cat)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive size-8 cursor-pointer"
                              onClick={() => handleOpenDelete(cat)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dialog component */}
      <CategoryDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        category={selectedCategory}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone. Custom categories referenced by transactions or budgets cannot be deleted.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        destructive
      />
    </PageContainer>
  );
}
