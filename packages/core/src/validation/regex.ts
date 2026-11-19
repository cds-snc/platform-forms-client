import { checkSync } from "recheck";
import type { ValidationError } from "./validationErrorTypes";

export const isSafeRegex = (pattern: string): boolean => {
  if (!pattern) return true;

  const result = checkSync(pattern, "", { timeout: 1000 });
  return result.status === "safe";
};

export const isValidRegex = (pattern: string): boolean => {
  if (!pattern) return true;
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

/**
 * getRegexByType [private] defines a mapping between the types of fields that need to be validated
 * Also defines the regex for validation, with a matching error code.
 */
export const getRegexByType = (type: string | undefined, regex?: string) => {
  interface RegexProps {
    [key: string]: {
      regex: RegExp | null;
      error: ValidationError;
    };
  }

  const REGEX_CONFIG: RegexProps = {
    email: {
      regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.([a-zA-Z0-9-]{2,}))+$/,
      error: { code: "invalid-email" },
    },
    alphanumeric: {
      regex: /^[A-Za-z0-9\s]+$/,
      error: { code: "invalid-alphanumeric" },
    },
    text: {
      regex: /[^\n]/,
      error: { code: "pattern-mismatch" },
    },
    name: {
      regex: null,
      error: { code: "pattern-mismatch" },
    },
    number: {
      regex: /^[\d., ]+$/,
      error: { code: "invalid-number" },
    },
    canBeNegativeNumber: {
      regex: /^-?[\d., ]+$/,
      error: { code: "invalid-number" },
    },
    date: {
      regex: /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/, //mm/dd/yyyy
      error: { code: "invalid-date-format" },
    },
    phone: {
      regex: /^(\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?$/, // +125468464178
      error: { code: "invalid-phone" },
    },
  };
  if (type === "custom") {
    if (regex && !isValidRegex(regex)) {
      return {
        regex: null,
        error: { code: "unsafe-regex" } satisfies ValidationError,
      };
    }
    return {
      regex: regex ? new RegExp(regex) : null,
      error: { code: "pattern-mismatch" } satisfies ValidationError,
    };
  }
  return type ? REGEX_CONFIG[type] : null;
};
