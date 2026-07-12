import React from "react";
import { Search } from "lucide-react";
import { Input } from "../primitives/input";
import { cn } from "../lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchBar({ className, containerClassName, ...props }: SearchBarProps) {
  return (
    <div className={cn("relative min-w-64 flex-1", containerClassName)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        className={cn(
          "bg-background/50 border-border/80 focus-visible:ring-primary/30 pl-9",
          className,
        )}
        {...props}
      />
    </div>
  );
}
