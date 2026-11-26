import * as XLSX from "xlsx";
import { format } from "date-fns";
import { TransactionKind } from "@fin-ai/shared-types";

/**
 * Key-value option representation for selectable UI dropdowns.
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Resolved column indices for bulk upload spreadsheet headers.
 */
export interface BulkUploadColumnIndices {
  dateIdx: number;
  typeIdx: number;
  amountIdx: number;
  categoryIdx: number;
  accountIdx: number;
  toAccountIdx: number;
  notesIdx: number;
}

/**
 * Generates a unique client-side identifier for bulk transaction rows.
 *
 * @returns Unique string ID for tabular tracking.
 */
export function generateRowId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `row_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Normalizes and formats various Excel date formats (serial numbers, Date objects, strings) into YYYY-MM-DD.
 * Uses UTC components when inspecting Date objects to avoid timezone offset date-shift bugs.
 *
 * @param rawDate - Cell value from Excel parser.
 * @param todayFallback - Fallback date string if value is missing or unparseable.
 * @returns Date string formatted as YYYY-MM-DD.
 */
export function parseExcelDate(
  rawDate: unknown,
  todayFallback = format(new Date(), "yyyy-MM-dd"),
): string {
  if (rawDate === null || rawDate === undefined || rawDate === "") {
    return todayFallback;
  }

  // 1. Numeric Excel serial code (e.g. 45620 or 45620.5)
  if (typeof rawDate === "number" && !isNaN(rawDate)) {
    if (typeof XLSX.SSF !== "undefined" && typeof XLSX.SSF.parse_date_code === "function") {
      const parsed = XLSX.SSF.parse_date_code(rawDate);
      if (parsed && parsed.y && parsed.m && parsed.d) {
        const y = String(parsed.y).padStart(4, "0");
        const m = String(parsed.m).padStart(2, "0");
        const d = String(parsed.d).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }
    const ms = Math.round((rawDate - 25569) * 86400 * 1000);
    const dt = new Date(ms);
    if (!isNaN(dt.getTime())) {
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const d = String(dt.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  // 2. Native Date object (from XLSX cellDates: true)
  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    const y = rawDate.getUTCFullYear();
    const m = String(rawDate.getUTCMonth() + 1).padStart(2, "0");
    const d = String(rawDate.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 3. String date formats
  if (typeof rawDate === "string") {
    const trimmed = rawDate.trim();
    if (!trimmed) return todayFallback;

    // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    const yyyymmdd = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (yyyymmdd) {
      const [, y, m, d] = yyyymmdd;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return format(parsed, "yyyy-MM-dd");
    }
  }

  return todayFallback;
}

/**
 * Maps spreadsheet header names to predictable column index positions without collision.
 * Specifically avoids keyword collisions between source account and destination account.
 *
 * @param headerRow - Array of header values extracted from row 1.
 * @returns Resolved indices for all transaction fields.
 */
export function resolveColumnIndices(headerRow: unknown[]): BulkUploadColumnIndices {
  const normalized = headerRow.map((h) =>
    String(h || "")
      .toLowerCase()
      .trim(),
  );

  const toAccountIdx = normalized.findIndex(
    (h) =>
      h.includes("to account") ||
      h.includes("destination") ||
      h === "to" ||
      h.includes("to_account"),
  );

  const accountIdx = normalized.findIndex(
    (h, idx) =>
      idx !== toAccountIdx &&
      (h === "account" ||
        h.includes("from account") ||
        h.includes("source") ||
        h.includes("src") ||
        (h.includes("account") && !h.includes("to") && !h.includes("dest"))),
  );

  const dateIdx = normalized.findIndex((h) => h.includes("date"));
  const typeIdx = normalized.findIndex((h) => h.includes("type") || h.includes("kind"));
  const amountIdx = normalized.findIndex(
    (h) => h.includes("amount") || h.includes("price") || h.includes("val"),
  );
  const categoryIdx = normalized.findIndex((h) => h.includes("category") || h.includes("cat"));
  const notesIdx = normalized.findIndex(
    (h) =>
      h.includes("note") || h.includes("desc") || h.includes("remark") || h.includes("summary"),
  );

  return {
    dateIdx: dateIdx >= 0 ? dateIdx : 0,
    typeIdx: typeIdx >= 0 ? typeIdx : 1,
    amountIdx: amountIdx >= 0 ? amountIdx : 2,
    categoryIdx: categoryIdx >= 0 ? categoryIdx : 3,
    accountIdx: accountIdx >= 0 ? accountIdx : 4,
    toAccountIdx: toAccountIdx >= 0 ? toAccountIdx : 5,
    notesIdx: notesIdx >= 0 ? notesIdx : 6,
  };
}

/**
 * Matches a raw text value against select options using prioritized matching:
 * ID match -> exact bare label match -> exact full label -> starts-with -> substring.
 *
 * @param rawName - Raw string value from spreadsheet cell.
 * @param options - Available selectable options.
 * @returns Matched option or undefined if unrecognized.
 */
export function matchEntityOption(
  rawName: string,
  options: SelectOption[],
): SelectOption | undefined {
  if (!rawName || !rawName.trim()) return undefined;
  const target = rawName.trim().toLowerCase();

  // 1. Direct ID match
  const idMatch = options.find((o) => o.value === rawName.trim());
  if (idMatch) return idMatch;

  // 2. Exact match against bare label (stripping type annotations like ' (BANK)')
  const cleanOptions = options.map((o) => ({
    option: o,
    bareLabel: o.label
      .replace(/\s*\([^)]*\)$/, "")
      .trim()
      .toLowerCase(),
    fullLabel: o.label.trim().toLowerCase(),
  }));

  const exactBareMatch = cleanOptions.find((c) => c.bareLabel === target);
  if (exactBareMatch) return exactBareMatch.option;

  const exactFullMatch = cleanOptions.find((c) => c.fullLabel === target);
  if (exactFullMatch) return exactFullMatch.option;

  // 3. Starts-with match on bare label
  const startsWithMatch = cleanOptions.find((c) => c.bareLabel.startsWith(target));
  if (startsWithMatch) return startsWithMatch.option;

  // 4. Substring match on bare label (minimum 3 chars to prevent false positives)
  if (target.length >= 3) {
    const substringMatch = cleanOptions.find((c) => c.bareLabel.includes(target));
    if (substringMatch) return substringMatch.option;
  }

  return undefined;
}

/**
 * Parses user-entered transaction type strings into canonical TransactionKind.
 *
 * @param rawType - Raw type string from sheet.
 * @returns Resolved TransactionKind enum.
 */
export function parseTransactionKind(rawType: string): TransactionKind {
  const norm = rawType.toLowerCase().trim();
  if (norm.includes("inc") || norm.includes("credit")) return TransactionKind.INCOME;
  if (norm.includes("trans")) return TransactionKind.TRANSFER;
  if (norm.includes("invest")) return TransactionKind.INVESTMENT;
  if (norm.includes("goal")) return TransactionKind.GOAL;
  return TransactionKind.EXPENSE;
}
