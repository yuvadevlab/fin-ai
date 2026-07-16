"use client";

import React, { useState, useMemo } from "react";
import { FormDialog, FormDialogField, FormField } from "@finai/ui";
import { createBudgetSchema } from "@finai/validation";
import { useCreateBudget } from "../api/createBudget";
import { useCategories } from "@/features/categories/api/getCategories";
import { useWorkspace } from "@/providers";

export interface BudgetDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BudgetDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BudgetDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const { workspaceId } = useWorkspace();
  const createBudget = useCreateBudget(workspaceId);
  const { data: categories = [] } = useCategories(workspaceId);

  const categoryOptions = useMemo(() => {
    // Only allow budgeting for expense categories (excluding Income)
    return categories
      .filter((c) => c.group !== "Income")
      .map((c) => ({
        label: c.name,
        value: c.id,
      }));
  }, [categories]);

  const [values, setValues] = useState<Record<string, string>>({
    categoryId: "",
    limit: "",
    period: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    const parseResult = createBudgetSchema.safeParse({
      categoryId: values.categoryId,
      limit: Number(values.limit || 0),
      period: values.period,
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
      await createBudget.mutateAsync(parseResult.data);
      setOpen?.(false);
      // Reset form
      setValues({
        categoryId: "",
        limit: "",
        period: "MONTHLY",
        startDate: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({
        root: apiErr?.message || "An error occurred while creating the budget.",
      });
    }
  };

  const fields: FormField[] = [
    {
      type: "select",
      name: "categoryId",
      label: "Category",
      options: categoryOptions,
    },
    {
      type: "number",
      name: "limit",
      label: "Budget Limit",
      placeholder: "0.00",
    },
    {
      type: "select",
      name: "period",
      label: "Period",
      options: [
        { label: "Weekly", value: "WEEKLY" },
        { label: "Monthly", value: "MONTHLY" },
        { label: "Yearly", value: "YEARLY" },
      ],
    },
    {
      type: "text",
      name: "startDate",
      label: "Start Date",
      placeholder: "YYYY-MM-DD",
    },
  ];

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Create Budget"
      description="Set a spending cap for a category to track limits."
      submitLabel="Create Budget"
      loading={createBudget.isPending}
      onCancel={() => setOpen?.(false)}
      onSubmit={handleSubmit}
    >
      {errors.root && (
        <div className="bg-destructive/15 text-destructive mb-4 rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}
      <div className="space-y-4">
        {fields.map((field) => (
          <FormDialogField
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            error={errors[field.name]}
            onChange={(val) => handleChange(field.name, val)}
          />
        ))}
      </div>
    </FormDialog>
  );
}
