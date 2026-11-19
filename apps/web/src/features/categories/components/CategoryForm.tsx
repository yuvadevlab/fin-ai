"use client";

import { FormDialogField, FormField, Label, toast } from "@fin-ai/ui";
import { EmojiPickerField } from "./EmojiPickerField";
import { Button } from "@fin-ai/ui";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useSuggestEmoji } from "../api";
import { UI_COPY } from "@/lib/ui-copy";

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
  groupOptions = [...UI_COPY.CATEGORIES.GROUP_OPTIONS],
}: CategoryFormProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { mutateAsync: suggestEmojiAsync } = useSuggestEmoji();

  const handleAiSuggest = async () => {
    const categoryName = values["name"];
    if (!categoryName) {
      toast.error(UI_COPY.CATEGORIES.NAME_REQUIRED);
      return;
    }

    setIsSuggesting(true);
    try {
      const data = await toast
        .promise(suggestEmojiAsync(categoryName), {
          loading: UI_COPY.CATEGORIES.EMOJI_LOADING,
          success: UI_COPY.CATEGORIES.EMOJI_SUCCESS,
          error: (error: Error) => error.message || UI_COPY.CATEGORIES.EMOJI_ERROR,
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
      label: UI_COPY.CATEGORIES.NAME_LABEL,
      placeholder: UI_COPY.CATEGORIES.NAME_PLACEHOLDER,
      autoComplete: "off",
    },
    {
      type: "select",
      name: "group",
      label: UI_COPY.CATEGORIES.GROUP_LABEL,
      options: groupOptions,
    },
  ];

  return (
    <div className="fn-category-form">
      {fields.map((field) => (
        <FormDialogField
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          error={errors[field.name]}
          onChange={onChange}
        />
      ))}

      <div className="fn-category-icon-group">
        <div className="fn-category-icon-header">
          <Label className="fn-category-icon-label">{UI_COPY.CATEGORIES.ICON_LABEL}</Label>
          <Button
            variant="ghost"
            size="sm"
            className="fn-category-suggest-btn"
            onClick={handleAiSuggest}
            disabled={isSuggesting}
          >
            <Sparkles className="fn-category-suggest-icon" />
            {isSuggesting ? UI_COPY.CATEGORIES.AI_SUGGESTING : UI_COPY.CATEGORIES.AI_SUGGEST}
          </Button>
        </div>
        <EmojiPickerField value={values["icon"] ?? ""} onChange={(val) => onChange("icon", val)} />
        {errors["icon"] && <p className="fn-form-banner-error">{errors["icon"]}</p>}
      </div>
    </div>
  );
}
