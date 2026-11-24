import { type DateObject, type DateFormat } from "@gcforms/types";

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
 * Check that a DateObject is a valid date
 *
 * @param dateObject
 * @returns boolean
 */
export const isValidDate = (dateObject: DateObject): boolean => {
  if (!isValidDateObject(dateObject)) {
    return false;
  }

  if (dateObject.YYYY < 1000 || dateObject.YYYY > 9999) {
    return false;
  }

  const { YYYY, MM, DD } = dateObject;
  const date = new Date(YYYY, MM - 1, DD);

  return date.getFullYear() === YYYY && date.getMonth() + 1 === MM && date.getDate() === DD;
};

export const getDateResponseValidity = (value: unknown): "valid" | "invalid" | "malformed" => {
  if (typeof value !== "string") return "malformed";

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError) return "malformed";
    throw error;
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return "malformed";

  // Partial objects (including null parts serialized from NaN input) are ordinary invalid answers.
  return isValidDateObject(parsed) && isValidDate(parsed) ? "valid" : "invalid";
};

export const isValidDateResponse = (value: unknown): boolean =>
  getDateResponseValidity(value) === "valid";

/**
 * Check that a date format is valid
 *
 * @param dateFormat
 * @returns boolean
 */
export const isValidDateFormat = (dateFormat: DateFormat): boolean => {
  return ["YYYY-MM-DD", "DD-MM-YYYY", "MM-DD-YYYY"].includes(dateFormat);
};
