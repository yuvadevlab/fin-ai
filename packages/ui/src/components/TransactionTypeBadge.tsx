import { cn } from "../lib/utils";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

interface TransactionTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: TransactionType;
}

const typeStyles: Record<TransactionType, string> = {
  INCOME: "bg-primary/10 text-primary",
  EXPENSE: "bg-destructive/10 text-destructive",
  TRANSFER: "bg-amber-500/10 text-amber-600",
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
