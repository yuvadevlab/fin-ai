import { describe, it, expect } from "vitest";
import { parseAgentDateExpression, resolveAgentTransactionDate } from "./date-expression";

/**
 * Anchored on 2026-09-05, which is a SATURDAY:
 *   Fri = 2026-09-04, Mon = 2026-08-31, Sat last week = 2026-08-29,
 *   coming Mon = 2026-09-07.
 */
const TODAY = "2026-09-05";

describe("parseAgentDateExpression", () => {
  it("resolves relative day words", () => {
    expect(parseAgentDateExpression("today", TODAY)).toBe("2026-09-05");
    expect(parseAgentDateExpression("now", TODAY)).toBe("2026-09-05");
    expect(parseAgentDateExpression("yesterday", TODAY)).toBe("2026-09-04");
    expect(parseAgentDateExpression("day before yesterday", TODAY)).toBe("2026-09-03");
    expect(parseAgentDateExpression("tomorrow", TODAY)).toBe("2026-09-06");
    expect(parseAgentDateExpression("day after tomorrow", TODAY)).toBe("2026-09-07");
  });

  it("resolves '<N> <unit> ago/back' with digits and number words", () => {
    expect(parseAgentDateExpression("2 days back", TODAY)).toBe("2026-09-03");
    expect(parseAgentDateExpression("two days ago", TODAY)).toBe("2026-09-03");
    expect(parseAgentDateExpression("three weeks ago", TODAY)).toBe("2026-08-15");
    expect(parseAgentDateExpression("one month ago", TODAY)).toBe("2026-08-06");
    expect(parseAgentDateExpression("2 years back", TODAY)).toBe("2024-09-05");
  });

  it("resolves future relative phrases", () => {
    expect(parseAgentDateExpression("in 3 days", TODAY)).toBe("2026-09-08");
    expect(parseAgentDateExpression("two weeks from now", TODAY)).toBe("2026-09-19");
    expect(parseAgentDateExpression("next week", TODAY)).toBe("2026-09-12");
  });

  it("resolves 'last <unit>'", () => {
    expect(parseAgentDateExpression("last week", TODAY)).toBe("2026-08-29");
    expect(parseAgentDateExpression("last month", TODAY)).toBe("2026-08-06");
    expect(parseAgentDateExpression("last day", TODAY)).toBe("2026-09-04");
  });

  it("resolves month-day phrases and infers the most recent past year", () => {
    expect(parseAgentDateExpression("aug 15", TODAY)).toBe("2026-08-15");
    expect(parseAgentDateExpression("on aug 15", TODAY)).toBe("2026-08-15");
    expect(parseAgentDateExpression("15 aug", TODAY)).toBe("2026-08-15");
    expect(parseAgentDateExpression("15 aug 2026", TODAY)).toBe("2026-08-15");
    expect(parseAgentDateExpression("15th of aug", TODAY)).toBe("2026-08-15");
    // Future month-day without a year rolls back to last year.
    expect(parseAgentDateExpression("dec 25", TODAY)).toBe("2025-12-25");
  });

  it("resolves weekdays (today is Saturday)", () => {
    expect(parseAgentDateExpression("friday", TODAY)).toBe("2026-09-04");
    expect(parseAgentDateExpression("on friday", TODAY)).toBe("2026-09-04");
    expect(parseAgentDateExpression("monday", TODAY)).toBe("2026-08-31");
    expect(parseAgentDateExpression("last friday", TODAY)).toBe("2026-09-04");
    expect(parseAgentDateExpression("last saturday", TODAY)).toBe("2026-08-29");
    expect(parseAgentDateExpression("saturday", TODAY)).toBe("2026-09-05");
    expect(parseAgentDateExpression("next monday", TODAY)).toBe("2026-09-07");
  });

  it("resolves absolute dates (ISO, DD/MM/YYYY, bare DD/MM)", () => {
    expect(parseAgentDateExpression("2026-08-15", TODAY)).toBe("2026-08-15");
    expect(parseAgentDateExpression("15/08/2026", TODAY)).toBe("2026-08-15");
    expect(parseAgentDateExpression("15/08", TODAY)).toBe("2026-08-15");
  });

  it("returns null for unparseable or impossible phrases", () => {
    expect(parseAgentDateExpression("sometime soon", TODAY)).toBeNull();
    expect(parseAgentDateExpression("31/02", TODAY)).toBeNull();
    expect(parseAgentDateExpression("", TODAY)).toBeNull();
  });
});

describe("resolveAgentTransactionDate", () => {
  it("falls back to today when nothing is provided", () => {
    expect(resolveAgentTransactionDate({}, TODAY)).toBe(TODAY);
  });

  it("uses the explicit date when no expression is given", () => {
    expect(resolveAgentTransactionDate({ date: "2026-08-20" }, TODAY)).toBe("2026-08-20");
  });

  it("lets dateExpression win over a model-guessed date", () => {
    expect(
      resolveAgentTransactionDate({ date: "2026-08-01", dateExpression: "yesterday" }, TODAY),
    ).toBe("2026-09-04");
  });

  it("throws a user-friendly error for unparseable expressions", () => {
    expect(() => resolveAgentTransactionDate({ dateExpression: "asdf qwer" }, TODAY)).toThrowError(
      /couldn't interpret the date/,
    );
  });
});
