import { Language } from "@root/lib/types/form-builder-types";

export const langToLocale = (lang?: string) => (lang === "fr" ? "fr-CA" : "en-CA");

export interface NumberFormatConfig {
  currencyCode?: string;
  stepCount?: number;
  useThousandsSeparator?: boolean;
}

export const getNumberFormatOptions = (config: NumberFormatConfig): Intl.NumberFormatOptions =>
  config.currencyCode
    ? { style: "currency", currency: config.currencyCode, useGrouping: true }
    : {
        minimumFractionDigits: config.stepCount ?? 0,
        maximumFractionDigits: config.stepCount ?? 0,
        useGrouping: config.useThousandsSeparator ?? false,
      };

export const isNumericInput = (value: string) => value !== "" && !Number.isNaN(Number(value));

export const isIntegerInput = (value: string) => /^-?\d+$/.test(value);

const formatDecimalStringForDisplay = (
  value: string,
  locale: string,
  options: Intl.NumberFormatOptions
) => {
  const [integerPart, fractionPart = ""] = value.split(".");
  const decimalSeparator =
    new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === "decimal")
      ?.value ?? ".";
  const formattedInteger = new Intl.NumberFormat(locale, {
    ...options,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(BigInt(integerPart));
  const formattedFraction = fractionPart.padEnd(options.minimumFractionDigits ?? 0, "0");

  return formattedFraction
    ? `${formattedInteger}${decimalSeparator}${formattedFraction}`
    : formattedInteger;
};

export const formatNumericStringForDisplay = (
  value: string,
  locale: string,
  options: Intl.NumberFormatOptions
): string => {
  const normalized = normalizeLocaleInput(value, locale);

  if (!isNumericInput(normalized)) return value;

  if (!isIntegerInput(normalized) && normalized.includes(".")) {
    return formatDecimalStringForDisplay(normalized, locale, options);
  }

  const numericValue = isIntegerInput(normalized) ? BigInt(normalized) : Number(normalized);

  return new Intl.NumberFormat(locale, options).format(numericValue);
};

/**
 * Format a numeric value into a locale-aware display string.
 *
 * @param value  - The raw number to format
 * @param lang   - The language code ("en" or "fr")
 * @param config - Currency code and/or decimal step count
 * @returns The formatted string, or "" if the value is NaN
 */
export const formatNumberForDisplay = (
  value: number | bigint,
  lang: Language,
  config: NumberFormatConfig
): string => {
  if (typeof value === "number" && Number.isNaN(value)) return "";
  const locale = langToLocale(lang);
  const options = getNumberFormatOptions(config);
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Normalize a locale-formatted input string into a plain numeric string
 * that `Number()` can parse.
 *
 * Steps:
 *  1. Derive the locale's grouping separator and decimal separator via Intl.
 *  2. Remove all grouping separators (e.g. "," in en-CA, narrow-no-break-space in fr-CA).
 *  3. Replace the locale decimal separator with "." if it differs (e.g. "," → ".").
 *  4. Strip any remaining non-numeric characters (currency symbols, etc.).
 *
 * @param raw    - The raw string value from the input element
 * @param locale - The BCP 47 locale string (e.g. "en-CA", "fr-CA")
 * @returns A string safe to pass to `Number()`, e.g. "1234.56"
 */
export const normalizeLocaleInput = (raw: string, locale: string): string => {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
  const groupSep = parts.find((p) => p.type === "group")?.value ?? "";
  const decimalSep = parts.find((p) => p.type === "decimal")?.value ?? ".";

  let result = raw;

  if (groupSep) {
    result = result.split(groupSep).join("");
  }

  if (decimalSep !== ".") {
    result = result.replace(decimalSep, ".");
  }

  // Strip anything that's not a digit, decimal point, or leading minus
  result = result.replace(/[^0-9.\-]/g, "");

  return result;
};
