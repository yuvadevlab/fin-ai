import { Input } from "@/primitives/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { Textarea } from "@/primitives/textarea";
import { Label } from "@radix-ui/react-label";
import React from "react";

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
  }[];
}

export type FormField = InputField | TextareaField | SelectField;

export interface FormDialogFieldProps {
  field: FormField;
  value?: string;
  onChange?: (name: string, value: string) => void;
  error?: string;
}

export function FormDialogField({ field, value, onChange, error }: FormDialogFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}

        {field.required && <span className="text-destructive ml-1">*</span>}
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
        <Select
          name={field.name}
          value={value}
          required={field.required}
          onValueChange={(val) => onChange?.(field.name, val)}
        >
          <SelectTrigger id={field.id || field.name}>
            <SelectValue placeholder={field.placeholder ?? "Select an option"} />
          </SelectTrigger>

          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
