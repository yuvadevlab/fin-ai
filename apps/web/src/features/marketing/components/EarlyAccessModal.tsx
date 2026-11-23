"use client";

/**
 * @file apps/web/src/features/marketing/components/EarlyAccessModal.tsx
 * @description Accessible semantic modal dialog for FinAI Private Beta / Early Access applications.
 * Built entirely with @fin-ai/ui components and WCAG-compliant ARIA semantics.
 * @module @fin-ai/web/features/marketing/components/EarlyAccessModal
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@fin-ai/ui";
import { CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { useEarlyAccess } from "../context/EarlyAccessContext";
import { EARLY_ACCESS_COPY } from "@/lib/ui-copy/early-access";

export function EarlyAccessModal(): React.JSX.Element {
  const { isOpen, closeModal } = useEarlyAccess();
  const copy = EARLY_ACCESS_COPY;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState<string>("EXPENSE_TRACKING");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPrimaryGoal("EXPENSE_TRACKING");
    setNotes("");
    setHoneypot("");
    setSubmitted(false);
    setErrorMessage(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      if (submitted) {
        setTimeout(resetForm, 300);
      }
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(copy.ERROR_NAME_REQUIRED);
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage(copy.ERROR_EMAIL_INVALID);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          primaryGoal,
          notes: notes.trim(),
          company_url_catch: honeypot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || copy.ERROR_GENERIC);
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : copy.ERROR_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="fn-mkt-dialog-content">
        {submitted ? (
          <div className="fn-mkt-success-pane" role="status" aria-live="polite">
            <div className="fn-mkt-success-icon-wrap" aria-hidden="true">
              <CheckCircle2 className="fn-icon-lg" />
            </div>
            <h2 className="fn-mkt-success-title">{copy.SUCCESS_TITLE}</h2>
            <p className="fn-mkt-success-desc">{copy.SUCCESS_SUBTITLE.replace("{email}", email)}</p>
            <Button onClick={() => handleOpenChange(false)} className="fn-mkt-btn-primary">
              {copy.SUCCESS_CLOSE}
            </Button>
          </div>
        ) : (
          <>
            <div className="fn-mkt-dialog-header">
              <Badge className="fn-mkt-badge fn-mkt-dialog-badge">
                <Sparkles className="fn-icon-xs" aria-hidden="true" />
                <span>{copy.BADGE}</span>
              </Badge>
              <DialogTitle className="fn-mkt-dialog-title">{copy.MODAL_TITLE}</DialogTitle>
              <DialogDescription className="fn-mkt-dialog-desc">
                {copy.MODAL_SUBTITLE}
              </DialogDescription>
            </div>

            <form onSubmit={handleSubmit} className="fn-mkt-dialog-form" noValidate>
              {/* Anti-bot Honeypot input */}
              <Input
                type="text"
                name="company_url_catch"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="fn-sr-only"
                aria-hidden="true"
              />

              <div className="fn-mkt-form-field">
                <Label htmlFor="ea-name" className="fn-mkt-form-label">
                  {copy.FIELD_NAME}
                </Label>
                <Input
                  id="ea-name"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={errorMessage ? true : undefined}
                  aria-describedby={errorMessage ? "ea-form-error" : undefined}
                  placeholder={copy.FIELD_NAME_PLACEHOLDER}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="fn-mkt-form-field">
                <Label htmlFor="ea-email" className="fn-mkt-form-label">
                  {copy.FIELD_EMAIL}
                </Label>
                <Input
                  id="ea-email"
                  type="email"
                  required
                  aria-required="true"
                  aria-invalid={errorMessage ? true : undefined}
                  aria-describedby={errorMessage ? "ea-form-error" : undefined}
                  placeholder={copy.FIELD_EMAIL_PLACEHOLDER}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="fn-mkt-form-field">
                <Label htmlFor="ea-goal" className="fn-mkt-form-label">
                  {copy.FIELD_GOAL}
                </Label>
                <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                  <SelectTrigger id="ea-goal" aria-label={copy.FIELD_GOAL}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {copy.FIELD_GOAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="fn-mkt-form-field">
                <Label htmlFor="ea-notes" className="fn-mkt-form-label">
                  {copy.FIELD_NOTES}
                </Label>
                <Textarea
                  id="ea-notes"
                  rows={2}
                  placeholder={copy.FIELD_NOTES_PLACEHOLDER}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {errorMessage && (
                <div
                  id="ea-form-error"
                  role="alert"
                  aria-live="assertive"
                  className="fn-mkt-form-error"
                >
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="fn-mkt-btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="fn-icon-sm fn-spin" aria-hidden="true" />
                    <span>{copy.SUBMITTING}</span>
                  </>
                ) : (
                  <span>{copy.SUBMIT_BUTTON}</span>
                )}
              </Button>

              <div className="fn-mkt-form-capacity-note">{copy.CAPACITY_NOTE}</div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
