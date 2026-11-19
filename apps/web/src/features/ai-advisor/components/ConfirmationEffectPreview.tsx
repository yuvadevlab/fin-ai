interface ConfirmationEffectPreviewProps {
  effectRows: [string, string][];
  maskValue: (key: string, value: string) => string;
}

export function ConfirmationEffectPreview({
  effectRows,
  maskValue,
}: ConfirmationEffectPreviewProps) {
  if (effectRows.length === 0) return null;

  return (
    <div className="fn-confirm-effect-container">
      <div className="fn-confirm-effect-grid">
        {effectRows.map(([key, value], idx) => (
          <div key={key} className="fn-confirm-effect-col">
            <p className="fn-confirm-effect-lbl">{key}</p>
            <p className="fn-confirm-effect-val">{maskValue(key, value)}</p>
            {idx < effectRows.length - 1 && <span className="fn-confirm-effect-arrow">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
