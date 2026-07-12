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

      <DialogContent className={className ?? "sm:max-w-md"}>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>

            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          <div className="space-y-4 py-4">{children}</div>

          <DialogFooter>
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
