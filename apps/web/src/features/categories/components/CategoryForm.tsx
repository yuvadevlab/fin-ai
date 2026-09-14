"use client";

import { FormDialogField, FormField, Label, toast } from "@finai/ui";
import { EmojiPickerField } from "./EmojiPickerField";
import { Button } from "@finai/ui";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useSuggestEmoji } from "../api";

export interface CategoryFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  groupOptions?: { label: string; value: string }[];
}

export function CategoryForm({
  values,
  errors,
  onChange,
  groupOptions = [
    { label: "Income", value: "Income" },
    { label: "Fixed Expenses", value: "Fixed Expenses" },
    { label: "Variable Expenses", value: "Variable Expenses" },
    { label: "Savings & Investments", value: "Savings & Investments" },
    { label: "Transfer", value: "Transfer" },
  ],
}: CategoryFormProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { mutateAsync: suggestEmojiAsync } = useSuggestEmoji();

  const handleAiSuggest = async () => {
    const categoryName = values["name"];
    if (!categoryName) {
      toast.error("Please enter a category name first");
      return;
    }

    setIsSuggesting(true);
    try {
      const data = await toast
        .promise(suggestEmojiAsync(categoryName), {
          loading: "Asking AI for an emoji suggestion...",
          success: "Emoji suggested!",
          error: (error: Error) => error.message || "Failed to suggest emoji. Please try again.",
        })
        .unwrap();
      onChange("icon", data.emoji);
    } catch {
      // Error toast is shown by toast.promise
    } finally {
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
      label: "Category Group",
      options: groupOptions,
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
