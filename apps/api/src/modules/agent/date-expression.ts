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

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const WORD_NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const UNIT_DAYS: Record<string, number> = {
  day: 1,
  days: 1,
  week: 7,
  weeks: 7,
  fortnight: 14,
  fortnights: 14,
  // A "month" is intentionally approximated as 30 days: relative phrases like
  // "2 months ago" only need a reasonable past date for a transaction, and
  // true calendar-month math would add complexity for no practical gain.
  month: 30,
  months: 30,
  year: 365,
  years: 365,
};

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

/** UTC-safe weekday index (0=Sunday) for a YYYY-MM-DD string. */
function weekdayOfISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Construct a "YYYY-MM-DD" string from parts, or null for impossible dates.
 * The 2000–2100 year bound is a sanity fence: out-of-range years here are
 * almost always LLM garbage, not real user intent.
 */
function dateFromParts(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  // lastDayOfMonth handles leap years automatically via the UTC constructor.
  if (day < 1 || day > lastDayOfMonth(year, month)) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Add a (possibly negative) number of days to a "YYYY-MM-DD" string.
 * Arithmetic happens in UTC so day boundaries never shift with DST — the
 * input is a calendar date, not a timestamp, so timezones must not matter.
 */
function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dateFromParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())!;
}

function parseNumberToken(token: string): number | undefined {
  const asWord = WORD_NUMBERS[token];
  if (asWord !== undefined) return asWord;
  const asInt = Number.parseInt(token, 10);
  return Number.isNaN(asInt) ? undefined : asInt;
}
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

const NUM_PAT = "(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";
const UNIT_PAT = "(day|days|week|weeks|fortnight|fortnights|month|months|year|years)";
const MONTH_PAT = `(${Object.keys(MONTHS).join("|")})`;
const WEEKDAY_PAT = `(${Object.keys(WEEKDAYS).join("|")})`;
