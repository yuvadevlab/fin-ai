import React from "react";
import { cn } from "../lib/utils";

export interface ScoreGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  rating?: string;
  showRating?: boolean;
}

export function ScoreGauge({
  score,
  maxScore = 100,
  size = 160,
  strokeWidth = 10,
  label = "out of 100",
  rating,
  showRating = false,
  className,
  ...props
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(score, maxScore));
  const normalizedPercentage = maxScore > 0 ? clampedScore / maxScore : 0;

  // Center coordinate and radius
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // ~326.73
  const strokeDashoffset = circumference - normalizedPercentage * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-primary stroke-primary";
    if (val >= 60) return "text-amber-500 stroke-amber-500";
    return "text-destructive stroke-destructive";
  };

  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center", className)}
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={maxScore}
      aria-label={`Score: ${clampedScore} ${label}`}
      {...props}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
          {/* Track background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-[stroke-dashoffset] duration-800 ease-out",
              getScoreColor(clampedScore),
            )}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-foreground text-4xl font-bold tracking-tight">{clampedScore}</span>
          <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            {label}
          </span>
        </div>
      </div>

      {showRating && rating && (
        <p className={cn("mt-4 text-sm font-bold", getScoreColor(clampedScore))}>{rating}</p>
      )}
    </div>
  );
}
