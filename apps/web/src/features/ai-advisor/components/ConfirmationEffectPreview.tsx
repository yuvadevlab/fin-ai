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
    <div className="border-border/40 border-t px-3.5 py-2.5">
      <div className="flex items-center gap-3">
        {effectRows.map(([key, value], idx) => (
          <div key={key} className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-muted-foreground text-[11px] font-medium uppercase">{key}</p>
              <p className="text-foreground mt-0.5 text-sm font-semibold tabular-nums">
                {maskValue(key, value)}
              </p>
            </div>
            {idx < effectRows.length - 1 && (
              <span className="text-muted-foreground text-lg">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
