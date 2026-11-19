import React from "react";
import {
  DatePicker,
  Input,
  Label,
  SearchableSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@yuva-devlab/ui";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

export interface BaseField {
  name: string;
  label: string;
  placeholder?: string;
}

export type FieldType =
  "text" | "email" | "password" | "number" | "date" | "url" | "textarea" | "select";

export interface InputField
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type">, BaseField {
  type: Exclude<FieldType, "textarea" | "select">;
}

export interface TextareaField
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">, BaseField {
  type: "textarea";
  rows?: number;
}

export interface SelectField
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">, BaseField {
  type: "select";
  options: {
    label: string;
    value: string;
    group?: string;
  }[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onAddNew?: (searchQuery: string) => void;
  addNewLabel?: string;
}

export type FormField = InputField | TextareaField | SelectField;

export interface FormDialogFieldProps {
  field: FormField;
  value?: string;
  onChange?: (name: string, value: string) => void;
  error?: string;
}

export function FormDialogField({ field, value, onChange, error }: FormDialogFieldProps) {
  const formCopy = UI_COPY_CONSTANTS.FORM_DIALOG;

  return (
    <div className="fn-form-dialog-field">
      <Label htmlFor={field.name}>
        {field.label}

        {field.required && <span className="fn-required-indicator">*</span>}
      </Label>

      {field.type === "textarea" ? (
        <Textarea
          {...field}
          id={field.id || field.name}
          name={field.name}
          value={value}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          required={field.required}
          onChange={(e) => onChange?.(field.name, e.target.value)}
        />
      ) : field.type === "select" ? (
        field.searchable || field.onAddNew || field.options.length > 6 ? (
          <SearchableSelect
            id={field.id || field.name}
            options={field.options}
            value={value}
            onChange={(val) => onChange?.(field.name, val)}
            placeholder={field.placeholder ?? formCopy.SELECT_OPTION_PLACEHOLDER}
            searchPlaceholder={field.searchPlaceholder ?? formCopy.SEARCH_PLACEHOLDER(field.label)}
            onAddNew={field.onAddNew}
            addNewLabel={field.addNewLabel ?? formCopy.ADD_NEW_LABEL(field.label)}
          />
        ) : (
          <Select
            name={field.name}
            value={value}
            required={field.required}
            onValueChange={(val) => onChange?.(field.name, val)}
          >
            <SelectTrigger id={field.id || field.name}>
              <SelectValue placeholder={field.placeholder ?? formCopy.SELECT_OPTION_PLACEHOLDER} />
            </SelectTrigger>

            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      ) : field.type === "date" ? (
        <DatePicker
          value={value}
          placeholder={field.placeholder || formCopy.PICK_DATE_PLACEHOLDER}
          onChange={(date) => onChange?.(field.name, date)}
        />
      ) : (
        <Input
          {...field}
          id={field.id || field.name}
          name={field.name}
          type={field.type}
          value={value}
          placeholder={field.placeholder}
          required={field.required}
          onChange={(e) => onChange?.(field.name, e.target.value)}
        />
      )}

      {error ? <p className="fn-field-error">{error}</p> : null}
    </div>
  );
}
