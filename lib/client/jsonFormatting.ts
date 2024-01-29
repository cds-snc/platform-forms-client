import { padAngleBrackets } from "@clientComponents/form-builder/util";
/**
 * Cleans up the provided JSON to remove any opening/closing angle brackets
 * without preceding or trailing spaces (ie <something> becomes < something >)
 * @param object
 * @param key
 */
export const cleanAngleBrackets = (object: Record<string, unknown>, key: string) => {
  const value = object[key];

  if (typeof value === "undefined") return;

  if (typeof value === "string") {
    object[key] = padAngleBrackets(value);
  }

  return;
};
