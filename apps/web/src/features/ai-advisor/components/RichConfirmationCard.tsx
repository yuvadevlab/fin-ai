"use client";

import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import { Button, cn } from "@fin-ai/ui";
import { usePrivacyMode } from "@/hooks";
import { useWorkspace } from "@/providers";
import type { AgentConfirmation } from "../api/agentTypes";
import {
  AgentCardType,
  AgentConfirmationStatus,
  AgentToolName,
  ConfirmationRowLabel,
} from "@fin-ai/shared-types";
import { partitionRows } from "../utils/partitionRows";
import { formatConfirmationLabel } from "../utils/confirmationDisplay";
import { getTransactionTypeAccent, STATUS_META } from "../utils/confirmationCardStyles";
import { BulkConfirmationCarousel } from "./BulkConfirmationCarousel";
import { ConfirmationEffectPreview } from "./ConfirmationEffectPreview";
import { UI_COPY } from "@/lib/ui-copy";

interface RichConfirmationCardProps {
  confirmation: AgentConfirmation;
  onConfirm: (actionId: string, tool: string) => void;
  onReject: (actionId: string, itemIndex?: number) => void;
  disabled?: boolean;
  isExecuting?: boolean;
}

/**
 * Rich confirmation card for single agent-proposed write action.
 * Supports transaction-type accents (destructive for expense, primary for income, etc.).
 */
export function RichConfirmationCard({
  confirmation,
  onConfirm,
  onReject,
  disabled = false,
  isExecuting = false,
}: RichConfirmationCardProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const { isReadOnly } = useWorkspace();

  const isBulk =
    confirmation.card.type === AgentCardType.BULK_CONFIRMATION ||
    confirmation.tool === AgentToolName.TRANSACTIONS_BULK_CREATE ||
    confirmation.card.rows?.some(
      ([k]) => k === ConfirmationRowLabel.BULK_COUNT || k === "__bulk_count__",
    );

  if (isBulk) {
    return (
      <BulkConfirmationCarousel
        confirmation={confirmation}
        onConfirm={onConfirm}
        onReject={onReject}
        disabled={disabled}
        isExecuting={isExecuting}
      />
    );
  }

  const { card, status } = confirmation;
  const pending = status === AgentConfirmationStatus.PENDING;
  const meta = isExecuting
    ? {
        label: UI_COPY.ADVISOR.CONFIRMATION_STATUS.EXECUTING,
        className: "fn-confirm-card-status-badge--executing",
      }
    : STATUS_META[status];

  const { effectRows, detailRows } = partitionRows(card.rows ?? []);
  const typeAccent = getTransactionTypeAccent(card.rows);

  const SENSITIVE_KEYS =
    /account|balance|amount|limit|salary|income|net\s*worth|total|value|price/i;
  const MONEY_PATTERN = /^[\u20b9$\u20ac\u00a3]|\d[,.]\d/;
  const maskValue = (key: string, value: string): string => {
    if (!isPrivacyMode) return value;
    if (SENSITIVE_KEYS.test(key) || MONEY_PATTERN.test(value))
      return "\u2022\u2022\u2022\u2022\u2022\u2022";
    return value;
  };

  return (
    <div className={cn("fn-confirm-card", typeAccent?.border)}>
      {/* Header */}
      <div className="fn-confirm-card-header">
        <ShieldAlert
          size={16}
          className={cn("fn-confirm-card-icon", typeAccent?.icon)}
          aria-hidden="true"
        />
        <p className="fn-confirm-card-title">{card.title}</p>
        <span className={cn("fn-confirm-card-status-badge", meta.className)}>
          {isExecuting ? (
            <Loader2 className="fn-confirm-loader" />
          ) : pending ? (
            <span className="fn-confirm-pulse-dot" />
          ) : null}
          {meta.label}
        </span>
      </div>

      <ConfirmationEffectPreview effectRows={effectRows} maskValue={maskValue} />

      {/* Detail rows */}
      {detailRows.length > 0 && (
        <div className="fn-confirm-card-details">
          {detailRows.map(([key, value]) => {
            const isTypeKey = key.toLowerCase() === "type";
            return (
              <div key={key} className="fn-confirm-card-row">
                <span className="fn-confirm-card-key">{formatConfirmationLabel(key)}</span>
                {isTypeKey && typeAccent ? (
                  <span className={cn("fn-confirm-card-type-badge", typeAccent.badge)}>
                    {value}
                  </span>
                ) : (
                  <span className="fn-confirm-card-val">{maskValue(key, value)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions — only while pending */}
      {pending && (
        <div className="fn-confirm-card-actions">
          {isReadOnly ? (
            <p className="fn-confirm-card-notice fn-confirm-card-notice--error">
              {UI_COPY.WORKSPACES.READ_ONLY_BANNER}
            </p>
          ) : disabled ? (
            <p className="fn-confirm-card-notice">
              {UI_COPY.ADVISOR.CONFIRMATION.DEPENDENCY_NOTICE}
            </p>
          ) : (
            <p className="fn-confirm-card-notice">{UI_COPY.ADVISOR.CONFIRMATION.PENDING_NOTICE}</p>
          )}
          <div className="fn-confirm-card-btn-group">
            <Button
              size="sm"
              className="fn-confirm-btn"
              disabled={disabled || isExecuting || isReadOnly}
              onClick={() => onConfirm(confirmation.actionId, confirmation.tool)}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="fn-icon-sm fn-icon-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  <Check className="fn-icon-sm" />
                  Confirm
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="fn-confirm-btn"
              disabled={disabled || isExecuting}
              onClick={() => onReject(confirmation.actionId)}
            >
              <X className="fn-icon-sm" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
