import { fromZonedTime } from "date-fns-tz";

export const estToUtc = (
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number
): number => {
  const date = new Date(year, month - 1, day, hours, minutes);
  return fromZonedTime(date, "America/Toronto").getTime();
};
