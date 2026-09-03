import { Button } from "../primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../primitives/dialog";
import { cn } from "../lib/utils";

export interface FormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  trigger?: React.ReactNode;

  title: React.ReactNode;
  description?: React.ReactNode;

  children: React.ReactNode;

  submitLabel?: string;
  cancelLabel?: string;

  onSubmit?: React.SubmitEventHandler<HTMLFormElement>;
  onCancel?: () => void;

  loading?: boolean;

  className?: string;
}
export function FormDialog({
  open,
  onOpenChange,
  trigger,

  title,
  description,

  children,

  submitLabel = "Save",
  cancelLabel = "Cancel",

  onSubmit,
  onCancel,

  loading,

  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent
        className={cn(
          "flex max-h-[90dvh] flex-col overflow-hidden rounded-2xl p-0",
          className?.includes("max-w-") ? "" : "sm:max-w-md",
          className,
        )}
      >
        <form onSubmit={onSubmit} className="flex max-h-[90dvh] flex-col overflow-hidden">
          <DialogHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <DialogTitle>{title}</DialogTitle>

            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-2 sm:px-6">{children}</div>

          <DialogFooter className="flex-col-reverse gap-2 p-4 pt-2 sm:flex-row sm:gap-2 sm:p-6 sm:pt-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
