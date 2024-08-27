import { logMessage } from "@lib/logger";
import { DateFormat, DateObject } from "./types";

/**
 * Utility function to use when rendering a formatted date string
 *
 * @param dateFormat
 * @param dateObject
 * @returns string
 */
export const getFormattedDateFromObject = (
  dateFormat: DateFormat = "YYYY-MM-DD",
  dateObject: DateObject
): string => {
  // If an invalid date format is provided, use the default format
  if (!isValidDateFormat(dateFormat)) {
    dateFormat = "YYYY-MM-DD";
  }

  // If the date object is invalid, return a dash
  if (!isValidDateObject(dateObject)) {
    logMessage.info("Invalid date object", { dateObject });
    return "-";
  }

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
 * @returns boolean
 */
export const isValidDate = (dateObject: DateObject): boolean => {
  if (!isValidDateObject(dateObject)) {
    logMessage.info("Invalid date object", { dateObject });
    return false;
  }

  const { YYYY, MM, DD } = dateObject;
  const date = new Date(`${YYYY}-${MM}-${DD}`);
  return date.getFullYear() === YYYY && date.getMonth() + 1 === MM && date.getDate() === DD;
};

/**
 * Check that a date format is valid
 *
 * @param dateFormat
 * @returns boolean
 */
export const isValidDateFormat = (dateFormat: DateFormat): boolean => {
  return ["YYYY-MM-DD", "DD-MM-YYYY", "MM-DD-YYYY"].includes(dateFormat);
};

/**
 * Check that a date object is valid
 *
 * @param obj
 * @returns boolean
 */
export const isValidDateObject = (obj: unknown): obj is DateObject => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "YYYY" in obj &&
    "MM" in obj &&
    "DD" in obj &&
    typeof obj.YYYY === "number" &&
    typeof obj.MM === "number" &&
    typeof obj.DD === "number"
  );
};

/**
 * Check if a year is a leap year
 *
 * @param year
 * @returns boolean
 */
export const isLeapYear = (year: number) => {
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
};

/**
 * Get the maximum number of days in a month
 *
 * @param month
 * @param year
 * @returns number
 */
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
