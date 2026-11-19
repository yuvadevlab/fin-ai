import React from "react";
import { Search } from "lucide-react";
import { Input } from "@yuva-devlab/ui";
import { cn } from "../lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchBar({ className, containerClassName, ...props }: SearchBarProps) {
  return (
    <div className={cn("fn-search-container", containerClassName)}>
      <Input
        type="search"
        startIcon={<Search className="fn-search-icon" />}
        className={cn("fn-search-input", className)}
        {...props}
      />
    </div>
  );
}
