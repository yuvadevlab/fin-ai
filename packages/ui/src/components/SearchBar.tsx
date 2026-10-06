import React from "react";
import { Search } from "lucide-react";
import { Input } from "@yuva-devlab/ui";
import { cn } from "../lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchBar({ className, containerClassName, ...props }: SearchBarProps) {
  return (
    <div className={cn("w-full", containerClassName)}>
      <Input
        type="search"
        startIcon={<Search className="text-muted-foreground size-4" />}
        className={cn(
          "bg-background/50 border-border/80 focus-visible:ring-primary/30 w-full",
          className,
        )}
        {...props}
      />
    </div>
  );
}
