export const MONTHS: Record<string, number> = {
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

export const WORD_NUMBERS: Record<string, number> = {
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

export const UNIT_DAYS: Record<string, number> = {
  day: 1,
  days: 1,
  week: 7,
  weeks: 7,
  fortnight: 14,
  fortnights: 14,
  month: 30,
  months: 30,
  year: 365,
  years: 365,
};

export const WEEKDAYS: Record<string, number> = {
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

export const NUM_PAT = "(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";
export const UNIT_PAT = "(day|days|week|weeks|fortnight|fortnights|month|months|year|years)";
export const MONTH_PAT = `(${Object.keys(MONTHS).join("|")})`;
export const WEEKDAY_PAT = `(${Object.keys(WEEKDAYS).join("|")})`;

/** UTC-safe weekday index (0=Sunday) for a YYYY-MM-DD string. */
export function weekdayOfISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Construct a "YYYY-MM-DD" string from parts, or null for impossible dates. */
export function dateFromParts(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > lastDayOfMonth(year, month)) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Add a (possibly negative) number of days to a "YYYY-MM-DD" string in UTC. */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dateFromParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())!;
}

export function parseNumberToken(token: string): number | undefined {
  const asWord = WORD_NUMBERS[token];
  if (asWord !== undefined) return asWord;
  const asInt = Number.parseInt(token, 10);
  return Number.isNaN(asInt) ? undefined : asInt;
}
