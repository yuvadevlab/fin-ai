import { Check, ShieldAlert, X } from "lucide-react";
import { Button, cn } from "@yuva-devlab/ui";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

export type ConfirmationStatus = "pending" | "executed" | "rejected" | "failed";

export interface ConfirmationCardData {
  /** Unique id for this action (used by confirm/reject handlers). */
  actionId: string;
  /** Human-readable title for the proposed action. */
  title: string;
  /** Key-value rows displayed in the card body. */
  rows?: [string, string][];
  status: ConfirmationStatus;
}

export interface ConfirmationCardProps {
  confirmation: ConfirmationCardData;
  onConfirm: (actionId: string) => void;
  onReject: (actionId: string) => void;
  /**
   * When true, the confirm button is disabled with a hint explaining that
   * earlier actions must be confirmed first (for sequential dependent actions).
   */
  disabled?: boolean;
}

const STATUS_META: Record<ConfirmationStatus, { label: string; className: string }> = {
  pending: {
    label: UI_COPY_CONSTANTS.CONFIRMATION_CARD.AWAITING_APPROVAL,
    className: "fn-status-pending",
  },
  executed: {
    label: UI_COPY_CONSTANTS.CONFIRMATION_CARD.CONFIRMED,
    className: "fn-status-executed",
  },
  rejected: {
    label: UI_COPY_CONSTANTS.CONFIRMATION_CARD.REJECTED,
    className: "fn-status-rejected",
  },
  failed: {
    label: UI_COPY_CONSTANTS.CONFIRMATION_CARD.FAILED,
    className: "fn-status-failed",
  },
};

/**
 * Partitions card rows into before/after effect pairs vs plain detail rows.
 * Recognized effect key pairs: "before/after", "old/new limit",
 * "old/new balance", "current/new", "from/to".
 */
function partitionRows(cardRows: [string, string][]): {
  effectRows: [string, string][];
  detailRows: [string, string][];
} {
  const effectPairs = [
    ["before", "after"],
    ["old limit", "new limit"],
    ["old balance", "new balance"],
    ["current", "new"],
    ["from", "to"],
  ];

  const rows = cardRows ?? [];
  const used = new Set<number>();
  const effectRows: [string, string][] = [];

  for (const [lowHigh, highKey] of effectPairs) {
    const lowIdx = rows.findIndex(
      ([k], i) =>
        !used.has(i) &&
        k.toLowerCase().includes(lowHigh) &&
        !k.toLowerCase().includes("account") &&
        !k.toLowerCase().includes("category"),
    );
    const highIdx = rows.findIndex(([k], i) => !used.has(i) && k.toLowerCase().includes(highKey));
    if (lowIdx !== -1 && highIdx !== -1) {
      effectRows.push(rows[lowIdx], rows[highIdx]);
      used.add(lowIdx).add(highIdx);
      break; // only one effect pair per card
    }
  }

  const detailRows = rows.filter((_, i) => !used.has(i));
  return { effectRows, detailRows };
}

/**
 * Generic confirmation card for a proposed action.
 *
 * Shows a title, enriched detail rows, an optional before/after effect
 * preview (when rows contain paired keys like "Before/After"), and
 * confirm/reject actions while pending.
 *
 * Extracted from the AI Advisor's `RichConfirmationCard` so any feature
 * that proposes a write action can reuse the same UI pattern.
 */
export function ConfirmationCard({
  confirmation,
  onConfirm,
  onReject,
  disabled = false,
}: ConfirmationCardProps) {
  const { title, rows, status } = confirmation;
  const pending = status === "pending";
  const meta = STATUS_META[status];

  const { effectRows, detailRows } = partitionRows(rows ?? []);

  const copy = UI_COPY_CONSTANTS.CONFIRMATION_CARD;

  return (
    <div className="fn-confirm-card">
      {/* Header */}
      <div className="fn-confirm-card-header">
        <ShieldAlert className="fn-confirm-card-icon" aria-hidden="true" />
        <p className="fn-confirm-card-title">{title}</p>
        <span className={cn("fn-confirm-card-status-badge", meta.className)}>
          {pending && <span className="fn-confirm-pulse-dot" />}
          {meta.label}
        </span>
      </div>

      {/* Effect preview (before → after) when available */}
      {effectRows.length > 0 && (
        <div className="fn-confirm-effect-container">
          <div className="fn-confirm-effect-row">
            {effectRows.map(([key, value], idx) => (
              <div key={key} className="fn-confirm-effect-item">
                <div className="fn-confirm-effect-box">
                  <p className="fn-confirm-effect-key">{key}</p>
                  <p className="fn-confirm-effect-val">{value}</p>
                </div>
                {idx < effectRows.length - 1 && <span className="fn-confirm-effect-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail rows */}
      {detailRows.length > 0 && (
        <div className="fn-confirm-card-details">
          {detailRows.map(([key, value]) => (
            <div key={key} className="fn-confirm-card-row">
              <span className="fn-confirm-card-key">{key}</span>
              <span className="fn-confirm-card-val">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions — only while pending */}
      {pending && (
        <div className="fn-confirm-card-actions">
          {disabled && <p className="fn-confirm-card-notice">{copy.DEPENDENCY_NOTICE}</p>}
          <p className="fn-confirm-card-notice">{copy.PENDING_NOTICE}</p>
          <div className="fn-confirm-card-btn-group">
            <Button
              size="sm"
              className="fn-confirm-btn"
              disabled={disabled}
              onClick={() => onConfirm(confirmation.actionId)}
            >
              <Check className="size-3.5" />
              {copy.CONFIRM_BTN}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="fn-confirm-btn"
              onClick={() => onReject(confirmation.actionId)}
            >
              <X className="size-3.5" />
              {copy.CANCEL_BTN}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
