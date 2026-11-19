"use client";

import { useState, type ReactNode } from "react";
import { Sparkles, Check } from "lucide-react";
import {
  Button,
  cn,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
} from "@yuva-devlab/ui";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

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
  title = UI_COPY_CONSTANTS.AI_SUGGESTIONS_DIALOG.TITLE,
  description,
  suggestions,
  applyLabel = UI_COPY_CONSTANTS.AI_SUGGESTIONS_DIALOG.APPLY_SELECTED,
  onApply,
}: AISuggestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (t: string) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const handleApply = () => {
    onApply?.(picked);
    toast.success(UI_COPY_CONSTANTS.AI_SUGGESTIONS_DIALOG.APPLIED(picked.length));
    setPicked([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="fn-action-btn-with-icon">
            <Sparkles className="fn-search-icon" /> {title}
          </DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogBody>
          <ul className="fn-ai-suggest-list">
            {suggestions.map((s) => {
              const active = picked.includes(s.title);
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => toggle(s.title)}
                    className={cn("fn-ai-suggest-item", active && "is-active")}
                  >
                    <div className={cn("fn-ai-suggest-checkbox", active && "is-active")}>
                      {active ? <Check className="fn-ai-suggest-check-icon" /> : null}
                    </div>
                    <div className="fn-ai-suggest-content">
                      <p className="fn-ai-suggest-title">{s.title}</p>
                      <p className="fn-ai-suggest-detail">{s.detail}</p>
                      <p className="fn-ai-suggest-impact">{s.impact}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {UI_COPY_CONSTANTS.AI_SUGGESTIONS_DIALOG.CANCEL}
          </Button>
          <Button disabled={picked.length === 0} onClick={handleApply}>
            {applyLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
