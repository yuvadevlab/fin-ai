import { useState } from "react";
import { FormDialog } from "@finai/ui";
import { TransactionForm } from "./TransactionForm";

export interface AddTransactionDialogProps {
  trigger: React.ReactNode;
}

export function AddTransactionDialog({ trigger }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO
    // react-hook-form
    // zod
    // mutation
    // toast

    setOpen(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Add Transaction"
      description="Log a new expense, income or transfer."
      submitLabel="Save Transaction"
      onCancel={() => setOpen(false)}
      onSubmit={handleSubmit}
    >
      <TransactionForm />
    </FormDialog>
  );
}
