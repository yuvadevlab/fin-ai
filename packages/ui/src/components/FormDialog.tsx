import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@yuva-devlab/ui";
import { cn } from "../lib/utils";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

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
  const copy = UI_COPY_CONSTANTS.FORM_DIALOG;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className={cn("finai-dialog-content", className)}>
        <form onSubmit={onSubmit} className="finai-dialog-form">
          <DialogHeader className="finai-dialog-header">
            <DialogTitle>{title}</DialogTitle>

            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          <DialogBody className="finai-dialog-body">{children}</DialogBody>

          <DialogFooter className="finai-dialog-footer">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              {cancelLabel || copy.CANCEL}
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? copy.SAVING : submitLabel || copy.SAVE}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
