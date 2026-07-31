"use server";

import { FormElement } from "@lib/types";
import { AddressCompleteChoice, AddressCompleteResult, AddressElements } from "./types";
import { Answer } from "@lib/responseDownloadFormats/types";
import { logMessage } from "@lib/logger";
import { type Language } from "@lib/types/form-builder-types";

const autoCompleteUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws";
const retriveAddressUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.11/json3.ws";
const addressCompleteKey = process.env.NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY || "";

// Helper: inspect response.Items[0] for the documented 4-column error table.
const hasItems0Error = (responseData: unknown): boolean => {
  // see: www.canadapost-postescanada.ca/ac/support/api/addresscomplete-interactive-find
  // example error response: { "Items": [ { "Error": "Invalid Key", "Description": "The key is invalid.", "Cause": "--" } ] }

  try {
    if (!responseData || typeof responseData !== "object") return false;
    const maybe = responseData as { Items?: unknown };
    if (!Array.isArray(maybe.Items) || maybe.Items.length === 0) return false;
    const first = maybe.Items[0] as Record<string, unknown>;
    if (!first) return false;

    // The AddressComplete API returns a 4-column error table in Items[0]
    // with columns: Error, Description, Cause, Resolution. Normal results
    // also include a Description field, so only treat as an error when the
    // `Error` key exists (and is non-empty) or when both `Cause` and
    // `Resolution` keys are present per the documented error shape.
    const hasErrorKey =
      Object.prototype.hasOwnProperty.call(first, "Error") &&
      first.Error != null &&
      String(first.Error).trim() !== "";
    const hasCauseAndResolution =
      Object.prototype.hasOwnProperty.call(first, "Cause") &&
      Object.prototype.hasOwnProperty.call(first, "Resolution");

    if (hasErrorKey || hasCauseAndResolution) {
      logMessage.info(`AddressComplete API returned item-level error: ${JSON.stringify(first)}`);
      return true;
    }

    return false;
  } catch (e) {
    // If anything unexpected happens, don't treat as an item error.
    return false;
  }
};

// Function returns address complete list of choices.
export const getAddressCompleteChoices = async (
  query: string,
  countryCode: string
): Promise<{ items: AddressCompleteChoice[]; error?: string | null }> => {
  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&SearchTerm=" + encodeURIComponent(query);
  params += "&Country=" + encodeURIComponent(countryCode);

  if (!addressCompleteKey) {
    return { items: [], error: "API_KEY_MISSING" };
  }

  try {
    const response = await fetch(autoCompleteUrl + params, {
      headers: { "content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    if (!response.ok) {
      return { items: [], error: "SERVICE_UNAVAILABLE" };
    }

    const responseData = await response.json(); //Todo #4341  - Error Handling

    if (hasItems0Error(responseData)) {
      return { items: [], error: "SERVICE_UNAVAILABLE" };
    }

    return { items: (responseData?.Items as AddressCompleteChoice[]) || [], error: null };
  } catch (err: unknown) {
    return { items: [], error: "NETWORK_ERROR" };
  }
};

// Functions returns the selected address.
export const getSelectedAddress = async (
  value: string,
  countryCode: string,
  language: Language
): Promise<{ address: AddressElements | null; error?: string | null }> => {
  const selectedResult = value;
  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&Id=" + encodeURIComponent(selectedResult);
  params += "&Country=" + encodeURIComponent(countryCode);
  if (!addressCompleteKey) {
    return { address: null, error: "API_KEY_MISSING" };
  }

  try {
    const response = await fetch(retriveAddressUrl + params, {
      headers: { "content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    if (!response.ok) {
      return { address: null, error: "SERVICE_UNAVAILABLE" };
    }

    const responseData = await response.json();

    if (hasItems0Error(responseData)) {
      return { address: null, error: "SERVICE_UNAVAILABLE" };
    }

    const addressData = responseData?.Items as AddressCompleteResult[];

    const addressComponents = await getAddressComponents(addressData, language);

    return { address: addressComponents, error: null };
  } catch (err: unknown) {
    return { address: null, error: "NETWORK_ERROR" };
  }
};

// Function returns the address set from a retreive.
export const getAddressCompleteRetrieve = async (
  query: string,
  countryCode: string
): Promise<{ items: AddressCompleteChoice[]; error?: string | null }> => {
  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&LastId=" + encodeURIComponent(query);
  params += "&Country=" + encodeURIComponent(countryCode);

  if (!addressCompleteKey) {
    return { items: [], error: "API_KEY_MISSING" };
  }

  try {
    const response = await fetch(autoCompleteUrl + params, {
      headers: { "content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    if (!response.ok) {
      return { items: [], error: "SERVICE_UNAVAILABLE" };
    }

    const responseData = await response.json(); //Todo #4341  - Error Handling

    if (hasItems0Error(responseData)) {
      return { items: [], error: "SERVICE_UNAVAILABLE" };
    }

    return { items: (responseData?.Items as AddressCompleteChoice[]) || [], error: null };
  } catch (err: unknown) {
    return { items: [], error: "NETWORK_ERROR" };
  }
};

// Helper function combines API component results into single address object.
export const getAddressComponents = async (
  addressCompleteResult: AddressCompleteResult[],
  language: Language
) => {
  const englishResult = addressCompleteResult.find((result) => result.Language === "ENG");
  const frenchResult = addressCompleteResult.find((result) => result.Language === "FRE");

  // Pick ENG or FRE based on language. (en vs fr)
  let resultData = language === "en" ? englishResult : frenchResult;
  if (resultData === undefined) {
    resultData = addressCompleteResult[0];
  }

  let streetAddress =
    (resultData.POBoxNumber ? resultData.Line1 : "") +
    (resultData?.SubBuilding ? resultData?.SubBuilding + "-" : "") +
    resultData?.BuildingNumber +
    " " +
    resultData?.Street;

  if (streetAddress.trim() === "") {
    streetAddress = resultData.Line1; // If we have no address, try line1. (eg: Rural Route 4)
  }

  if (streetAddress.trim() === "") {
    streetAddress = resultData.Line2; // If we still have no address, try line2. (eg: 12 De Octubre in Managua, Nicaragua)
  }

  const address = {
    streetAddress: streetAddress,
    city: resultData?.City,
    province: resultData?.ProvinceName,
    postalCode: resultData?.PostalCode,
    country: resultData?.CountryName,
  };

  return address as AddressElements;
};

export const getAddressAsString = async (address: AddressElements): Promise<string> => {
  return `${address.streetAddress}, ${address.city}, ${address.province} ${address.postalCode} ${address.country}`;
};

export const getAddressAsAnswerElements = async (
  question: FormElement,
  address: AddressElements,
  extraTranslations: { [key: string]: { en: string; fr: string } }
): Promise<Answer[]> => {
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
export async function matchesAddressPattern(input: string): Promise<boolean> {
  const pattern = /\s+-\s+\d+\s+Addresses$/i;
  return pattern.test(input);
}
