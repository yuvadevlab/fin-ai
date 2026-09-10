/**
 * Deterministic natural-language date resolution for agent transaction tools.
 *
 * Small local models are unreliable at calendar math, so instead of asking the
 * LLM to compute a date from "CURRENT DATE" (which produced 2026-09-25 for a
 * 2026-09-05 request), the agent extracts the user's ORIGINAL date wording
 * verbatim into `dateExpression` ("yesterday", "2 days back", "aug 15",
 * "tomorrow", "last friday", "on 15/08", "last week"). This pure parser converts
 * that wording to a YYYY-MM-DD date anchored on "today" — deterministically,
 * with no LLM math.
 */

import { serverTodayISO } from "./date.utils";
import {
  MONTHS,
  UNIT_DAYS,
  WEEKDAYS,
  NUM_PAT,
  UNIT_PAT,
  MONTH_PAT,
  WEEKDAY_PAT,
  weekdayOfISO,
  dateFromParts,
  addDaysISO,
  parseNumberToken,
} from "./utils/date-expression.constants";

/**
 * Convert a user's date wording to YYYY-MM-DD anchored on `today`.
 * Returns null when the phrase can't be understood.
 */
export function parseAgentDateExpression(expr: string, today: string): string | null {
  const s = expr
    .toLowerCase()
    .replace(/[,.]\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(?:(?:on|the|dated|date)\s+)+/, "")
    .trim();
  if (!s) return null;

  if (s === "today" || s === "now" || s === "current date" || s === "tonight") return today;
  if (s === "yesterday") return addDaysISO(today, -1);
  if (s === "tomorrow") return addDaysISO(today, 1);
  if (s === "day before yesterday" || s === "the day before yesterday")
    return addDaysISO(today, -2);
  if (s === "day after tomorrow" || s === "the day after tomorrow") return addDaysISO(today, 2);

  let m: RegExpExecArray | null;

  // "<N> <unit> ago/back/before/earlier/prior" — NUM_PAT/UNIT_PAT are
  // non-capturing, so wrap them to get m[1]=number, m[2]=unit.
  m = new RegExp(`^(${NUM_PAT})\\s+(${UNIT_PAT})\\s+(ago|back|before|earlier|prior)$`).exec(s);
  if (m) {
    const n = parseNumberToken(m[1]);
    if (n !== undefined) return addDaysISO(today, -n * UNIT_DAYS[m[2]]);
  }

  // "in <N> <unit>"
  m = new RegExp(`^in\\s+(${NUM_PAT})\\s+(${UNIT_PAT})$`).exec(s);
  if (m) {
    const n = parseNumberToken(m[1]);
    if (n !== undefined) return addDaysISO(today, n * UNIT_DAYS[m[2]]);
  }

  // "<N> <unit> from now / later / ahead / after"
  m = new RegExp(`^(${NUM_PAT})\\s+(${UNIT_PAT})\\s+(from now|later|ahead|after)$`).exec(s);
  if (m) {
    const n = parseNumberToken(m[1]);
    if (n !== undefined) return addDaysISO(today, n * UNIT_DAYS[m[2]]);
  }

  // "last <unit>" / "next <unit>"
  m = /^last\s+(day|week|month|year)$/.exec(s);
  if (m) {
    const delta = m[1] === "day" ? -1 : m[1] === "week" ? -7 : m[1] === "month" ? -30 : -365;
    return addDaysISO(today, delta);
  }
  m = /^next\s+(day|week|month|year)$/.exec(s);
  if (m) {
    const delta = m[1] === "day" ? 1 : m[1] === "week" ? 7 : m[1] === "month" ? 30 : 365;
    return addDaysISO(today, delta);
  }

  // "<weekday>" / "on <weekday>" / "this <weekday>" → most recent past
  // occurrence (today counts when today IS that weekday); "last <weekday>" →
  // strictly before today.
  m = new RegExp(`^(?:on\\s+|this\\s+|last\\s+)?${WEEKDAY_PAT}$`).exec(s);
  if (m) {
    const diff = weekdayOfISO(today) - WEEKDAYS[m[1]];
    let back: number;
    if (diff > 0) back = diff;
    else if (diff === 0) back = s.startsWith("last ") ? 7 : 0;
    else back = diff + 7;
    return addDaysISO(today, -back);
  }

  // "next <weekday>" → the coming occurrence, strictly after today.
  m = new RegExp(`^next\\s+${WEEKDAY_PAT}$`).exec(s);
  if (m) {
    let ahead = WEEKDAYS[m[1]] - weekdayOfISO(today);
    if (ahead <= 0) ahead += 7;
    return addDaysISO(today, ahead);
  }

  // YYYY-MM-DD
  m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (m) {
    const d = dateFromParts(+m[1], +m[2], +m[3]);
    if (d) return d;
  }

  // DD/MM/YYYY or MM/DD/YYYY (slashes, dots, dashes)
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  if (m) {
    const a = +m[1];
    const b = +m[2];
    const y = +m[3];
    const ddmm = dateFromParts(y, b, a);
    if (ddmm) return ddmm;
    const mmdd = dateFromParts(y, a, b);
    if (mmdd) return mmdd;
    return null;
  }

  // Bare "15/08" → most recent past occurrence (DD/MM preferred, then MM/DD)
  m = /^(\d{1,2})[/.-](\d{1,2})$/.exec(s);
  if (m) {
    const a = +m[1];
    const b = +m[2];
    const ty = Number(today.slice(0, 4));
    return mostRecentPast(
      [
        dateFromParts(ty, b, a),
        dateFromParts(ty, a, b),
        dateFromParts(ty - 1, b, a),
        dateFromParts(ty - 1, a, b),
      ],
      today,
    );
  }

  // "aug 15 [2026]" / "15 aug [2026]" (+ ordinals, "15th of aug")
  m = new RegExp(`^${MONTH_PAT}\\s+(\\d{1,2})(?:st|nd|rd|th)?[.,]?\\s*(\\d{4})?$`).exec(s);
  if (m) {
    const month = MONTHS[m[1]];
    const day = +m[2];
    const year = m[3] ? +m[3] : null;
    return year ? dateFromParts(year, month, day) : inferMostRecentYear(month, day, today);
  }
  m = new RegExp(`^(\\d{1,2})(?:st|nd|rd|th)?[.,]?\\s+(?:of\\s+)?${MONTH_PAT}\\s*(\\d{4})?$`).exec(
    s,
  );
  if (m) {
    const month = MONTHS[m[2]];
    const day = +m[1];
    const year = m[3] ? +m[3] : null;
    return year ? dateFromParts(year, month, day) : inferMostRecentYear(month, day, today);
  }

  return null;
}

export interface AgentDateInput {
  date?: string | null;
  dateExpression?: string | null;
}

/**
 * Resolve the effective transaction date. Precedence:
 * 1. `dateExpression` — parsed deterministically from the user's wording.
 * 2. `date` — user-named explicit date (schema already rejects bare future dates).
 * 3. Today — when the user gave no date at all.
 * Throws when `dateExpression` can't be parsed (schema refine guards this earlier).
 */
export function resolveAgentTransactionDate(
  input: AgentDateInput,
  today: string = serverTodayISO(),
): string {
  if (input.dateExpression) {
    const parsed = parseAgentDateExpression(input.dateExpression, today);
    if (parsed) return parsed;
    throw new Error(
      `I couldn't interpret the date "${input.dateExpression}". Please clarify with e.g. 'yesterday', '2 days ago', '15 Aug 2026', or 'tomorrow'.`,
    );
  }
  return input.date ?? today;
}

/** Infer the most recent PAST occurrence of a month/day (e.g. today is 2026-09-05 → "aug 15" = 2026-08-15; "dec 25" = 2025-12-25). */
function inferMostRecentYear(month: number, day: number, today: string): string | null {
  const thisYear = Number(today.slice(0, 4));
  const sameYear = dateFromParts(thisYear, month, day);
  if (sameYear && sameYear <= today) return sameYear;
  return dateFromParts(thisYear - 1, month, day);
}

/** Most recent occurrence among candidates that isn't in the future. */
function mostRecentPast(candidates: (string | null)[], today: string): string | null {
  const past = candidates.filter((d): d is string => d !== null && d <= today);
  if (past.length === 0) return null;
  return past.sort()[past.length - 1];
}
