/**
 * Converts a date/time specified in Eastern Time (America/New_York) to a UTC timestamp.
 * Automatically handles EST (UTC-5) and EDT (UTC-4) based on the date.
 *
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 * @param day - Day of month (1-31)
 * @param hours - Hours in 24-hour format (0-23)
 * @param minutes - Minutes (0-59)
 * @returns UTC timestamp in milliseconds
 */
export const estToUtc = (
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number
): number => {
  // Create a UTC timestamp for the given date/time values
  const utcTimestamp = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const utcDate = new Date(utcTimestamp);

  // Determine the Eastern Time offset for this specific moment
  // by checking what time it would be in ET if this were UTC
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcDate);
  const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || "0");

  const etYear = getPart("year");
  const etMonth = getPart("month");
  const etDay = getPart("day");
  const etHour = getPart("hour");
  const etMinute = getPart("minute");

  // Create Date objects to properly calculate the difference including day/month/year changes
  const etAsUtc = Date.UTC(etYear, etMonth - 1, etDay, etHour, etMinute, 0, 0);

  // The offset is the difference between what UTC shows and what ET shows
  const offsetMs = etAsUtc - utcTimestamp;

  // To convert ET input to UTC: subtract the offset
  return utcTimestamp - offsetMs;
};
