import { CyclePeriod } from "@finai/shared-types";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  addWeeks,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  format,
} from "date-fns";

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

/**
 * Calculates the default accounting cycle date range based on cycleStartDay (1-31) and period.
 * Default (1st of month): 1st -> 30th/31st of current month.
 * Custom (e.g. 10th of month): 10th of current cycle -> 9th of next month.
 */
export function getAccountingCycleRange(
  cycleStartDay: number = 1,
  period: CyclePeriod = "MONTHLY",
  referenceDate: Date = new Date(),
): DateRange {
  const currentDay = referenceDate.getDate();
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();

  if (period === "WEEKLY") {
    const startDate = setMilliseconds(setSeconds(setMinutes(setHours(referenceDate, 0), 0), 0), 0);
    const endDate = setMilliseconds(
      setSeconds(setMinutes(setHours(addWeeks(startDate, 1), 23), 59), 59),
      999,
    );
    return {
      startDate,
      endDate,
      label: `Weekly (${format(startDate, "MMM d")} – ${format(endDate, "MMM d")})`,
    };
  }

  if (period === "QUARTERLY") {
    const startQMonth = Math.floor(currentMonth / 3) * 3;
    const startDate = new Date(currentYear, startQMonth, 1);
    const endDate = endOfMonth(new Date(currentYear, startQMonth + 2, 1));
    return {
      startDate,
      endDate,
      label: `Quarterly (${format(startDate, "MMM yyyy")} – ${format(endDate, "MMM yyyy")})`,
    };
  }

  if (period === "YEARLY") {
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    return {
      startDate,
      endDate,
      label: `Yearly (${currentYear})`,
    };
  }

  // Default: MONTHLY
  let startYear = currentYear;
  let startMonth = currentMonth;

  if (currentDay < cycleStartDay) {
    const prevMonthDate = subMonths(referenceDate, 1);
    startYear = prevMonthDate.getFullYear();
    startMonth = prevMonthDate.getMonth();
  }

  const maxDaysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
  const actualStartDay = Math.min(cycleStartDay, maxDaysInStartMonth);

  const startDate = setMilliseconds(
    setSeconds(setMinutes(setHours(new Date(startYear, startMonth, actualStartDay), 0), 0), 0),
    0,
  );

  const nextMonthDate = addMonths(startDate, 1);
  const maxDaysInNextMonth = new Date(
    nextMonthDate.getFullYear(),
    nextMonthDate.getMonth() + 1,
    0,
  ).getDate();
  const actualNextStartDay = Math.min(cycleStartDay, maxDaysInNextMonth);

  const endDate = setMilliseconds(
    setSeconds(
      setMinutes(
        setHours(
          new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), actualNextStartDay - 1),
          23,
        ),
        59,
      ),
      59,
    ),
    999,
  );

  const startFormatted = format(startDate, "MMM d");
  const endFormatted = format(endDate, "MMM d, yyyy");

  return {
    startDate,
    endDate,
    label: `${startFormatted} – ${endFormatted}`,
  };
}

/**
 * Returns preset date ranges based on user cycle preferences.
 */
export function getPresetDateRanges(
  cycleStartDay: number = 1,
  period: CyclePeriod = "MONTHLY",
): Record<string, DateRange> {
  const now = new Date();
  const cycle = getAccountingCycleRange(cycleStartDay, period, now);
  const calMonthStart = startOfMonth(now);
  const calMonthEnd = endOfMonth(now);

  return {
    DEFAULT_CYCLE: {
      ...cycle,
      label: `Default Cycle (${cycle.label})`,
    },
    THIS_MONTH: {
      startDate: calMonthStart,
      endDate: calMonthEnd,
      label: `Calendar Month (${format(calMonthStart, "MMM yyyy")})`,
    },
    LAST_30_DAYS: {
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: now,
      label: "Last 30 Days",
    },
  };
}
