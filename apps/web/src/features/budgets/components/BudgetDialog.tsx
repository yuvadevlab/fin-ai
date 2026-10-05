"use client";

import React, { useState, useMemo } from "react";
import { FormDialog } from "@finai/ui";
import { createBudgetSchema, updateBudgetSchema } from "@finai/validation";
import { useCategories } from "@/features/categories/api";
import { CategoryDialog } from "@/features/categories/components/CategoryDialog";
import { useCreateBudget, useUpdateBudget, type Budget } from "../api";
import { BudgetForm } from "./BudgetForm";

export interface BudgetDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  budget?: Budget;
  onSuccess?: (budget: Budget) => void;
}

export function BudgetDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  budget,
  onSuccess,
}: BudgetDialogProps) {
  const isEditMode = budget !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const { data: categories = [] } = useCategories();

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [addCategoryInitialName, setAddCategoryInitialName] = useState("");

  const handleOpenAddCategory = (initialName?: string) => {
    setAddCategoryInitialName(initialName || "");
    setIsAddCategoryOpen(true);
  };

  const handleCategoryCreated = (createdCategory: { id: string; name: string }) => {
    handleChange("categoryId", createdCategory.id);
    setIsAddCategoryOpen(false);
  };

  const categoryOptions = useMemo(() => {
    return categories
      .filter((c) => c.group !== "Income")
      .map((c) => ({
        label: c.name,
        value: c.id,
      }));
  }, [categories]);

  const [values, setValues] = useState<Record<string, string>>({
    categoryId: budget?.categoryId ?? "",
    limit: budget ? String(budget.limit) : "",
    startDate: budget?.startDate ?? new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValues({
        categoryId: budget?.categoryId ?? "",
        limit: budget ? String(budget.limit) : "",
        startDate: budget?.startDate ?? new Date().toISOString().split("T")[0],
      });
      setErrors({});
    }
  }

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEditMode) {
      const parseResult = updateBudgetSchema.safeParse({
        limit: Number(values.limit || 0),
      });

      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        parseResult.error.issues.forEach((issue) => {
          const path = issue.path[0] as string;
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      try {
        const updated = await updateBudget.mutateAsync({
          id: budget.id,
          input: parseResult.data,
        });
        setOpen?.(false);
        onSuccess?.(updated);
      } catch (err) {
        const apiErr = err as { message?: string };
        setErrors({
          root: apiErr?.message || "An error occurred while updating the budget.",
        });
      }
      return;
    }

    const parseResult = createBudgetSchema.safeParse({
      categoryId: values.categoryId,
      limit: Number(values.limit || 0),
      startDate: values.startDate,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const created = await createBudget.mutateAsync(parseResult.data);
      setOpen?.(false);
      onSuccess?.(created);
      setValues({
        categoryId: "",
        limit: "",
        startDate: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while creating the budget.",
      });
    }
  };

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        title={isEditMode ? "Update Budget" : "Create Budget"}
        description={
          isEditMode
            ? `Adjust the monthly spending cap for ${budget?.category?.name || "this category"}.`
            : "Set a monthly spending cap for a category."
        }
        submitLabel={isEditMode ? "Update Limit" : "Create Budget"}
        loading={createBudget.isPending || updateBudget.isPending}
        onCancel={() => setOpen?.(false)}
        onSubmit={handleSubmit}
      >
        {errors.root && (
          <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
            {errors.root}
          </div>
        )}
        <div className="space-y-4">
          <BudgetForm
            values={values}
            errors={errors}
            onChange={handleChange}
            categories={categoryOptions}
            onAddCategory={handleOpenAddCategory}
            isEditMode={isEditMode}
          />
        </div>
      </FormDialog>

      <CategoryDialog
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        initialName={addCategoryInitialName}
        onSuccess={handleCategoryCreated}
      />
    </>
  );
}
