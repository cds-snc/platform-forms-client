import { DateFormat, DateObject } from "./types";

/**
 * Utility function to use when rendering a formatted date string
 *
 * @param dateFormat
 * @param dateObject
 * @returns
 */
export const getFormattedDateFromObject = (
  dateFormat: DateFormat = "YYYY-MM-DD",
  dateObject: DateObject
): string => {
  const { YYYY, MM, DD } = dateObject;

  const formattedDate = dateFormat
    .replace("YYYY", YYYY.toString())
    .replace("MM", MM.toString().padStart(2, "0"))
    .replace("DD", DD.toString().padStart(2, "0"));

  return formattedDate;
};

/**
 * Check that a DateObject is a valid date
 *
 * @param dateObject
 * @returns
 */
export const isValidDate = (dateObject: DateObject): boolean => {
  const { YYYY, MM, DD } = dateObject;
  const date = new Date(`${YYYY}-${MM}-${DD}`);
  return date.getFullYear() === YYYY && date.getMonth() + 1 === MM && date.getDate() === DD;
};

export const isLeapYear = (year: number) => {
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
};

export const getMaxMonthDay = (month: number, year: number) => {
  // Months are 1-indexed
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
};
