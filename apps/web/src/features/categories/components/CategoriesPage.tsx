"use client";

import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2, MoreVertical } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@fin-ai/ui";
import { Category, useCategories, useDeleteCategory } from "../api";
import { CategoryDialog } from "./CategoryDialog";
import { UI_COPY } from "@/lib/ui-copy";
import { useWorkspace } from "@/providers";
import { ReadOnlyWorkspaceBanner } from "@/components";

export function CategoriesPage() {
  const { isReadOnly } = useWorkspace();
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
        title={UI_COPY.CATEGORIES.PAGE_TITLE}
        description={UI_COPY.CATEGORIES.PAGE_DESCRIPTION}
        actions={
          isReadOnly ? undefined : (
            <Button size="sm" onClick={handleOpenAddCategory} className="fn-header-action-btn">
              <Plus className="fn-icon-md" /> {UI_COPY.CATEGORIES.ADD}
            </Button>
          )
        }
      />

      {isReadOnly && <ReadOnlyWorkspaceBanner />}

      {isLoading ? (
        <div className="fn-loading-center">
          <Loader2 className="fn-loading-spinner" />
        </div>
      ) : (
        <div className="fn-categories-stack">
          {Object.entries(groupedCategories).map(([groupName, cats]) => {
            if (cats.length === 0) return null;

            return (
              <div key={groupName} className="fn-category-group">
                <h3 className="fn-category-group-title">{groupName}</h3>

                <div className="fn-entity-grid">
                  {cats.map((cat) => (
                    <div key={cat.id} className="fn-category-card">
                      <div className="fn-category-info">
                        <div className="fn-category-icon">{cat.icon || "🏷️"}</div>
                        <div>
                          <p className="fn-category-name">{cat.name}</p>
                          {cat.isDefault && (
                            <span className="fn-category-default-badge">
                              {UI_COPY.CATEGORIES.DEFAULT}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isReadOnly && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="fn-category-menu-trigger"
                              aria-label={UI_COPY.CATEGORIES.ACTIONS_FOR(cat.name)}
                            >
                              <MoreVertical className="fn-icon-md" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="fn-category-menu-content">
                            <DropdownMenuItem
                              onClick={() => handleOpenEditCategory(cat)}
                              className="fn-goal-menu-item"
                            >
                              <Pencil className="fn-goal-menu-icon" /> {UI_COPY.CATEGORIES.EDIT}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDeleteCategory(cat)}
                              className="fn-goal-menu-item-destructive"
                            >
                              <Trash2 className="fn-goal-menu-icon" /> {UI_COPY.CATEGORIES.DELETE}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
        title={UI_COPY.CATEGORIES.DELETE_TITLE}
        description={UI_COPY.CATEGORIES.DELETE_CONFIRMATION(categoryToDelete?.name ?? "")}
        onConfirm={handleDeleteCategoryConfirm}
        confirmText={UI_COPY.COMMON.ACTIONS.DELETE}
        destructive
      />
    </PageContainer>
  );
}
