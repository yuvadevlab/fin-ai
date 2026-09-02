"use client";

import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { PageContainer, PageHeader, Button, ConfirmDialog } from "@finai/ui";
import { Category, useCategories, useDeleteCategory } from "../api";
import { CategoryDialog } from "./CategoryDialog";

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  // Category Add/Edit modal state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Delete category state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Group Categories by group string
  const groupedCategories = useMemo(() => {
    const defaultGroups = [
      "Income",
      "Fixed Expenses",
      "Variable Expenses",
      "Discretionary",
      "Savings & Investments",
      "Debt & Repayment",
    ];

    const groups: Record<string, Category[]> = {};

    defaultGroups.forEach((name) => {
      groups[name] = [];
    });

    categories.forEach((cat) => {
      const grp = cat.group || "Variable Expenses";
      if (!groups[grp]) {
        groups[grp] = [];
      }
      groups[grp].push(cat);
    });

    return groups;
  }, [categories]);

  const handleOpenAddCategory = () => {
    setFormMode("add");
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setFormMode("edit");
    setSelectedCategory(cat);
    setFormOpen(true);
  };

  const handleOpenDeleteCategory = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteOpen(true);
  };

  const handleDeleteCategoryConfirm = async () => {
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
        description="Organise and personalise your income and expense categories."
        actions={
          <Button size="sm" onClick={handleOpenAddCategory} className="cursor-pointer gap-1.5">
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
          {Object.entries(groupedCategories).map(([groupName, cats]) => {
            if (cats.length === 0) return null;

            return (
              <div key={groupName} className="space-y-4">
                <h3 className="text-foreground text-xs font-bold tracking-wider uppercase opacity-90">
                  {groupName}
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cats.map((cat) => (
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
                          {cat.isDefault && (
                            <span className="text-muted-foreground text-[10px]">Default</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
                          onClick={() => handleOpenEditCategory(cat)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive size-8 cursor-pointer"
                          onClick={() => handleOpenDeleteCategory(cat)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Dialog */}
      <CategoryDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        category={selectedCategory}
      />

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteCategoryConfirm}
        confirmText="Delete"
        destructive
      />
    </PageContainer>
  );
}
