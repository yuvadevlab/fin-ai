import React from "react";
import { cn } from "../lib/utils";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

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
  label = UI_COPY_CONSTANTS.SCORE_GAUGE.DEFAULT_LABEL,
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
    if (val >= 80) return "finai-score-gauge--excellent";
    if (val >= 60) return "finai-score-gauge--good";
    return "finai-score-gauge--poor";
  };

  return (
    <div
      className={cn("finai-score-gauge", className)}
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={maxScore}
      aria-label={`${UI_COPY_CONSTANTS.SCORE_GAUGE.SCORE_PREFIX} ${clampedScore} ${label}`}
      {...props}
    >
      <div className="finai-score-gauge-ring-wrap" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="finai-score-gauge-svg" aria-hidden="true">
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
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("finai-score-gauge-arc", getScoreColor(clampedScore))}
          />
        </svg>

        {/* Center label */}
        <div className="finai-score-gauge-center">
          <span className="finai-score-gauge-value">{clampedScore}</span>
          <span className="finai-score-gauge-label">{label}</span>
        </div>
      </div>

      {showRating && rating && (
        <p className={cn("finai-score-gauge-rating", getScoreColor(clampedScore))}>{rating}</p>
      )}
    </div>
  );
}
