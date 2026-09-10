import { TransactionType } from "@finai/shared-types";
import { cn } from "../lib/utils";

export type { TransactionType };

interface TransactionTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: TransactionType;
}

const typeStyles: Record<TransactionType, string> = {
  INCOME: "bg-primary/10 text-primary",
  EXPENSE: "bg-destructive/10 text-destructive",
  TRANSFER: "bg-amber-500/10 text-amber-600",
  INVESTMENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  GOAL: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export function TransactionTypeBadge({ type, className, ...props }: TransactionTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase",
        typeStyles[type],
        className,
      )}
      {...props}
    >
      {type.toLowerCase()}
    </span>
  );
}
