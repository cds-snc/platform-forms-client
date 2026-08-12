import { FormElement, FormElementTypes } from "@lib/types";
import type { AddressValidationError } from "@gcforms/core";
import enReview from "@i18n/translations/en/review.json";
import frReview from "@i18n/translations/fr/review.json";
import enResponses from "@i18n/translations/en/form-builder-responses.json";
import frResponses from "@i18n/translations/fr/form-builder-responses.json";
import { countries } from "@lib/managedData/countries";
import { Language } from "@lib/types/form-builder-types";
import { AddressElements } from "./types";
import { normalizeString, truncateField } from "@gcforms/core";

type AddressFieldKey = keyof AddressValidationError["fields"];

const getNestedTranslation = (source: unknown, path: string): string | undefined => {
  const value = path.split(".").reduce<unknown>((currentValue, segment) => {
    if (!currentValue || typeof currentValue !== "object") return undefined;
    return (currentValue as Record<string, unknown>)[segment];
  }, source);

  return typeof value === "string" ? value : undefined;
};

export const addressErrorSummaryFields = {
  streetAddress: {
    anchorSuffix: "streetAddress",
    labelPath: "addressComponents.streetName",
  },
  city: {
    anchorSuffix: "city",
    labelPath: "addressComponents.city",
  },
  province: {
    anchorSuffix: "province",
    labelPath: "addressComponents.provinceOrState",
  },
  postalCode: {
    anchorSuffix: "postal",
    labelPath: "addressComponents.postalCode",
  },
} satisfies Record<AddressFieldKey, { anchorSuffix: string; labelPath: string }>;

const addressErrorSummaryLabels = Object.fromEntries(
  (
    Object.entries(addressErrorSummaryFields) as Array<
      [AddressFieldKey, (typeof addressErrorSummaryFields)[AddressFieldKey]]
    >
  ).map(([fieldKey, config]) => [
    fieldKey,
    {
      en: getNestedTranslation(enReview, config.labelPath) ?? fieldKey,
      fr: getNestedTranslation(frReview, config.labelPath) ?? fieldKey,
    },
  ])
) as Record<AddressFieldKey, { en: string; fr: string }>;

export const isAddressValidationError = (value: unknown): value is AddressValidationError => {
  return Boolean(
    value &&
    typeof value === "object" &&
    "fields" in (value as Record<string, unknown>) &&
    (value as AddressValidationError).fields
  );
};

export const getAddressFieldLabel = (
  fieldKey: keyof typeof addressErrorSummaryFields,
  language: string
): string => {
  return language === "fr"
    ? addressErrorSummaryLabels[fieldKey].fr
    : addressErrorSummaryLabels[fieldKey].en;
};

export const getAddressAsString = (address: AddressElements, split?: boolean): string => {
  if (split) {
    let addressString = "";
    for (const key in address) {
      addressString += `${getNestedTranslation(enResponses, `addressComponents.${key}`) ?? key}\n${getNestedTranslation(frResponses, `addressComponents.${key}`) ?? key}: ${address[key as keyof AddressElements]}\n`;
    }
    return addressString;
  }
  return `${address.streetAddress}, ${address.city}, ${address.province} ${address.postalCode} ${address.country}`;
};

export const getAddressAsReviewElements = (
  address: AddressElements,
  element: FormElement,
  titleSet: AddressElements
) => {
  const returnArray = [];

  for (const key in address) {
    returnArray.push({
      type: FormElementTypes.textField,
      label: titleSet[key as keyof AddressElements],
      values: address[key as keyof AddressElements],
      element,
    });
  }
  return returnArray;
};

// This regex is an attempt to correct that until the API is updated.
//
// Breakdown of the regex:
// \s+-\s+ - Matches the " - " part with optional spaces around the hyphen.
// \d+ - Matches one or more digits.
// \s+Addresses$ - Matches the word "Addresses" with a space before it, ensuring it is at the end of the string.
// i - Makes the pattern case insensitive.
const nestedAddressPattern = /\s+-\s+(\d+)\s+(Addresses|Adresses)$/i;

interface AddressCompleteLabels {
  en: string;
  fr: string;
  current: string;
}

export function localizeAddressCompleteDescription(
  description: string,
  labels: AddressCompleteLabels
): string {
  const match = description.match(nestedAddressPattern);

  if (!match) {
    return description;
  }

  const [, count] = match;

  return description.replace(nestedAddressPattern, ` - ${count} ${labels.current}`);
}

// Helper function to test if the address has multiple results.
// -- ref: Issue #4464, Issue #4417
// This helper exists because the AddressComplete API has arbitrary returning of if an Address is Nested or not.
// This is usually determined by the
//    Next: AddressCompleNext;
//    Retrieve for a regular address or Find for a Nested.
// Eg: Typing in 'King St W, Toro' may return 'Retrieve' for all the auto complete values but it provides nested addresses.
export function matchesAddressPattern(input: string): boolean {
  return nestedAddressPattern.test(input);
}

export function getCountryNameFromCode(value: string | undefined, language: Language): string {
  if (!value) {
    return "Canada";
  }

  const trimmed = String(value).trim();
  const lowered = trimmed.toLowerCase();

  const byCode = countries.all.find((country) => String(country.id).toLowerCase() === lowered);
  if (byCode) {
    return String(byCode[language] || trimmed);
  }

  const byName = countries.all.find((country) => {
    const candidates = [country.en, country.fr].filter(Boolean) as string[];
    return candidates.some((name) => String(name).toLowerCase() === lowered);
  });
  if (byName) {
    return String(byName[language] || trimmed);
  }

  return trimmed;
}

export function getCountryCodeFromName(value?: string): string {
  if (!value) {
    return "CAN";
  }

  const trimmed = String(value).trim();
  const lowered = trimmed.toLowerCase();

  const byCode = countries.all.find((country) => String(country.id).toLowerCase() === lowered);
  if (byCode) {
    return String(byCode.id);
  }

  const byName = countries.all.find((country) => {
    const candidates = [country.en, country.fr].filter(Boolean) as string[];
    return candidates.some((name) => String(name).toLowerCase() === lowered);
  });
  if (byName) {
    return String(byName.id);
  }

  return trimmed;
}

// 2 characters preserves early typeahead behavior while avoiding some noise.
// e.g. 1 would be very broad (noisy) while 3 would delay useful results for short addresses.
export const MIN_ADDRESS_SEARCH_LENGTH = 2;

export const MAX_ADDRESS_FIELD_LENGTH = 200;
export const normalizeAddressField = (value: string): string => {
  return truncateField(normalizeString(value), MAX_ADDRESS_FIELD_LENGTH);
};

export const MAX_SEARCH_QUERY_LENGTH = 200;
export const normalizeQuery = (value: string): string => {
  return truncateField(normalizeString(value), MAX_SEARCH_QUERY_LENGTH);
};

const MAX_COUNTRY_CODE_LENGTH = 3;
export const normalizeCountryCode = (value: string): string => {
  return truncateField(normalizeString(value), MAX_COUNTRY_CODE_LENGTH);
};

export const MAX_POSTAL_CODE_LENGTH = 20;
export const normalizePostalCode = (value: string): string => {
  return truncateField(normalizeString(value), MAX_POSTAL_CODE_LENGTH);
};

export const isPositiveSafeInteger = (value: number): boolean => {
  return Number.isSafeInteger(value) && value > 0;
};
