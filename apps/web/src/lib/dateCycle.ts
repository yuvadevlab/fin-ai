import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from "date-fns";

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

/**
 * Calculates the monthly date range (start of month to end of month).
 */
export function getAccountingCycleRange(referenceDate: Date = new Date()): DateRange {
  const startDate = startOfMonth(referenceDate);
  const endDate = endOfMonth(referenceDate);

  return {
    startDate,
    endDate,
    label: format(startDate, "MMM yyyy"),
  };
}

/**
 * Returns standard preset date ranges for financial dashboards and transactions.
 * Default is always "This Month" (calendar month).
 */
export function getPresetDateRanges(): Record<string, DateRange> {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthDate = subMonths(now, 1);
  const lastMonthStart = startOfMonth(lastMonthDate);
  const lastMonthEnd = endOfMonth(lastMonthDate);
  const thisYearStart = startOfYear(now);
  const thisYearEnd = endOfYear(now);

  return {
    THIS_MONTH: {
      startDate: thisMonthStart,
      endDate: thisMonthEnd,
      label: `This Month (${format(thisMonthStart, "MMM yyyy")})`,
    },
    LAST_MONTH: {
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
      label: `Last Month (${format(lastMonthStart, "MMM yyyy")})`,
    },
    LAST_30_DAYS: {
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: now,
      label: "Last 30 Days",
    },
    THIS_YEAR: {
      startDate: thisYearStart,
      endDate: thisYearEnd,
      label: `This Year (${format(thisYearStart, "yyyy")})`,
    },
    ALL_TIME: {
      startDate: new Date(2020, 0, 1),
      endDate: now,
      label: "All Time",
    },
  };
}
