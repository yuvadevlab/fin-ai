/**
 * Date helpers for the agent runtime.
 *
 * `Date.toISOString()` is UTC-based, which can shift the day for users in
 * positive timezones (e.g. IST) around midnight. These helpers produce the
 * calendar date in the SERVER's local timezone using local getters — never
 * offset arithmetic, which double-shifts for negative offsets (IST).
 */

/**
 * Format a Date as a local-calendar "YYYY-MM-DD" string.
 * Uses local getters (getFullYear/getMonth/getDate) — NOT toISOString,
 * which converts to UTC and can shift the reported day near midnight for
 * users ahead of UTC (e.g. IST).
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "Today" as the server's local calendar date (YYYY-MM-DD), injected into every system prompt. */
export function serverTodayISO(): string {
  return toISODate(new Date());
}
