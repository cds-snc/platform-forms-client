import { DateFormat, DateObject } from "../FormattedDate";

/**
 * Utility function to use when rendering a formatted date string
 *
 * @param dateFormat
 * @param dateObject
 * @returns
 */
export const getFormattedDateFromObject = (
  dateFormat: DateFormat = "YYYY-MM-DD",
  dateObject: DateObject = { YYYY: 0, MM: 0, DD: 0 }
): string => {
  const { YYYY, MM, DD } = dateObject;

  const formattedDate = dateFormat
    .replace("YYYY", YYYY.toString())
    .replace("MM", MM.toString().padStart(2, "0"))
    .replace("DD", DD.toString().padStart(2, "0"));

  return formattedDate;
};
