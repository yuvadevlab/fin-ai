"use client";

import { useState, type ReactNode } from "react";
import { Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../primitives/dialog";
import { Button } from "../primitives/button";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export type AISuggestion = {
  title: string;
  detail: string;
  impact: string;
};

export interface AISuggestionsDialogProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  suggestions: AISuggestion[];
  applyLabel?: string;
  onApply?: (selected: string[]) => void;
}

export function AISuggestionsDialog({
  trigger,
  title = "AI Suggestions",
  description,
  suggestions,
  applyLabel = "Apply selected",
  onApply,
}: AISuggestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (t: string) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const handleApply = () => {
    onApply?.(picked);
    toast.success(`${picked.length} suggestion${picked.length > 1 ? "s" : ""} applied`);
    setPicked([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary size-4" /> {title}
          </DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <ul className="space-y-2">
          {suggestions.map((s) => {
            const active = picked.includes(s.title);
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => toggle(s.title)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {active ? <Check className="size-3" /> : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{s.detail}</p>
                    <p className="text-primary mt-2 text-xs font-medium">{s.impact}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={picked.length === 0} onClick={handleApply}>
            {applyLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
