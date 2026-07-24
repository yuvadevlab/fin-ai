"use client";

import { FormDialogField, FormField, Label, toast } from "@finai/ui";
import { EmojiPickerField } from "./EmojiPickerField";
import { Button } from "@finai/ui";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useSuggestEmoji } from "../api/suggestEmoji";

export interface CategoryFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function CategoryForm({ values, errors, onChange }: CategoryFormProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { mutate: suggestEmoji } = useSuggestEmoji();

  const handleAiSuggest = async () => {
    try {
      const categoryName = values["name"];
      if (!categoryName) {
        alert("Please enter a category name first");
        return;
      }

      setIsSuggesting(true);
      suggestEmoji(categoryName, {
        onSuccess: (data) => {
          onChange("icon", data.emoji);
          setIsSuggesting(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to suggest emoji. Please try again.",
          );
          setIsSuggesting(false);
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to suggest emoji. Please try again.",
      );
      setIsSuggesting(false);
    }
  };

  const fields: FormField[] = [
    {
      type: "text",
      name: "name",
      label: "Category Name",
      placeholder: "e.g. Subscriptions, Pet Care, Taxes",
      autoComplete: "off",
    },
    {
      type: "select",
      name: "group",
      label: "Group",
      options: [
        { label: "Fixed Expenses", value: "Fixed Expenses" },
        { label: "Variable Expenses", value: "Variable Expenses" },
        { label: "Savings & Investments", value: "Savings & Investments" },
        { label: "Income", value: "Income" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormDialogField
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          error={errors[field.name]}
          onChange={onChange}
        />
      ))}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-md leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Icon
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={handleAiSuggest}
            disabled={isSuggesting}
          >
            <Sparkles className="h-3 w-3" />
            {isSuggesting ? "Suggesting..." : "AI Suggest"}
          </Button>
        </div>
        <EmojiPickerField value={values["icon"] ?? ""} onChange={(val) => onChange("icon", val)} />
        {errors["icon"] && <p className="text-destructive text-sm">{errors["icon"]}</p>}
      </div>
    </div>
  );
}
