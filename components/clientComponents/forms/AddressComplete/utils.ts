import { FormElement, FormElementTypes } from "@lib/types";
import type { AddressValidationError } from "@gcforms/core";
import enReview from "@i18n/translations/en/review.json";
import frReview from "@i18n/translations/fr/review.json";
import { AddressElements } from "./types";
import { Answer } from "@lib/responseDownloadFormats/types";

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

export const getAddressAsString = (address: AddressElements): string => {
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

export const getAddressAsAnswerElements = (
  question: FormElement,
  address: AddressElements,
  extraTranslations: { [key: string]: { en: string; fr: string } }
): Answer[] => {
  const answerArray = [];
  for (const key in address) {
    const answerObj: Answer = {
      questionId: question.id,
      questionEn: extraTranslations[key as keyof AddressElements].en,
      questionFr: extraTranslations[key as keyof AddressElements].fr,
      answer: address[key as keyof AddressElements],
    };

    answerArray.push(answerObj);
  }

  return answerArray;
};

// Helper function to test if the address has multiple results.
// -- ref: Issue #4464, Issue #4417
// This helper exists because the AddressComplete API has arbitrary returning of if an Address is Nested or not.
// This is usually determined by the
//    Next: AddressCompleNext;
//    Retrieve for a regular address or Find for a Nested.
// Eg: Typing in 'King St W, Toro' may return 'Retrieve' for all the auto complete values but it provides nested Addresses.
// This regex is an attempt to correct that until the API is updated.
//
// Breakdown of the regex:
// \s+-\s+ - Matches the " - " part with optional spaces around the hyphen.
// \d+ - Matches one or more digits.
// \s+Addresses$ - Matches the word "Addresses" with a space before it, ensuring it is at the end of the string.
// i - Makes the pattern case insensitive.
export function matchesAddressPattern(input: string): boolean {
  const pattern = /\s+-\s+\d+\s+Addresses$/i;
  return pattern.test(input);
}
