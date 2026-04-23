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

/**
 * Format a numeric value into a locale-aware display string.
 *
 * @param value  - The raw number to format
 * @param lang   - The language code ("en" or "fr")
 * @param config - Currency code and/or decimal step count
 * @returns The formatted string, or "" if the value is NaN
 */
export const formatNumberForDisplay = (
  value: number,
  lang: Language,
  config: NumberFormatConfig
): string => {
  if (Number.isNaN(value)) return "";
  const locale = langToLocale(lang);
  const options = getNumberFormatOptions(config);
  return new Intl.NumberFormat(locale, options).format(value);
};
