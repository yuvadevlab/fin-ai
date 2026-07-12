import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../primitives/button";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  retry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <ContentCard
      className={cn(
        "border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
      {...props}
    >
      <AlertCircle className="text-destructive mb-3 size-10" />
      <h3 className="text-foreground text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-[40ch] text-sm">{description}</p>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry} className="mt-6">
          Try again
        </Button>
      )}
    </ContentCard>
  );
}
