"use client";

import React, { useState } from "react";
import { FormDialog } from "@finai/ui";
import { createCategorySchema } from "@finai/validation";
import { useCreateCategory, useUpdateCategory, Category } from "../api";
import { useActiveWorkspace } from "@/hooks";
import { CategoryForm } from "./CategoryForm";

export interface CategoryDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "add" | "edit";
  category?: Category | null;
}

export function CategoryDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  mode = "add",
  category,
}: CategoryDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const { activeWorkspaceId } = useActiveWorkspace();
  const createCategory = useCreateCategory(activeWorkspaceId);
  const updateCategory = useUpdateCategory(activeWorkspaceId);

  const getFormInitialValues = () => {
    return {
      name: category?.name ?? "",
      group: category?.group ?? "Variable Expenses",
      icon: category?.icon ?? "",
    };
  };

  const [values, setValues] = useState<Record<string, string>>(getFormInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCategoryKey, setPrevCategoryKey] = useState(() => JSON.stringify(category));
  const currentCategoryKey = JSON.stringify(category);

  if (open !== prevOpen || currentCategoryKey !== prevCategoryKey) {
    setPrevOpen(open);
    setPrevCategoryKey(currentCategoryKey);
    if (open) {
      setValues(getFormInitialValues());
      setErrors({});
    }
  }

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    const result = createCategorySchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (mode === "edit" && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          input: result.data,
        });
      } else {
        await createCategory.mutateAsync(result.data);
      }
      setOpen?.(false);
      // Reset form on success
      setValues({
        name: "",
        group: "Variable Expenses",
        icon: "tag",
      });
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while saving the category.",
      });
    }
  };

  const title = mode === "add" ? "Add Category" : "Edit Category";
  const description =
    mode === "add"
      ? "Create a new custom category for your transactions and budgets."
      : "Update custom category details.";
  const submitLabel = mode === "add" ? "Create Category" : "Save Changes";
  const loading = createCategory.isPending || updateCategory.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description={description}
      submitLabel={submitLabel}
      loading={loading}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <div className="space-y-4">
        <CategoryForm values={values} errors={errors} onChange={handleChange} />
      </div>
    </FormDialog>
  );
}
