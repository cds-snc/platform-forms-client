"use server";

import { FormElement } from "@lib/types";
import { AddressCompleteChoice, AddressCompleteResult, AddressElements } from "./types";
import { Answer } from "@lib/responseDownloadFormats/types";
import { logMessage } from "@lib/logger";
import { type Language } from "@lib/types/form-builder-types";
import { getClientIp } from "@root/lib/ip";
import { isValidCanadaPostId, isValidCountryCode, isValidLanguage } from "./validation";
import { checkRateLimited, incrementAndCheckRateLimiting } from "./rateLimiter";
import {
  MIN_ADDRESS_SEARCH_LENGTH,
  normalizeAddressField,
  normalizeCountryCode,
  normalizeQuery,
} from "./utils";

const autoCompleteUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws";
const retriveAddressUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.11/json3.ws";
const addressCompleteKey = process.env.ADDRESSCOMPLETE_API_KEY || "";

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
      const errorCode = Number(first.Error);

      // Ignore "Response Errors"
      // 1001 - The SearchTerm or LastId parameters were not supplied includes "" (empty string)
      if (errorCode === 1001) {
        return false;
      }

      if (errorCode >= 2 && errorCode <= 23) {
        logMessage.warn(`AddressComplete API returned error: ${JSON.stringify(first)}`);
      } else {
        logMessage.info(`AddressComplete API returned error: ${JSON.stringify(first)}`);
      }

      return true;
    }

    return false;
  } catch (e) {
    // If anything unexpected happens, don't treat as an item error.
    return false;
  }
};

// Function returns address complete list of choices.
// Note: find requests are not rate limited because the do not incur a cost to the API
export const getAddressCompleteChoices = async (
  query: string,
  countryCode: string,
  language: string
): Promise<{ items: AddressCompleteChoice[]; error?: string | null }> => {
  if (!addressCompleteKey) {
    return { items: [], error: "API_KEY_MISSING" };
  }

  // Do not call the API if the query is empty or only whitespace, as it will return a 1001 error (SearchTerm not supplied).
  // Also avoid upstream calls for short queries that are unlikely to produce useful results.
  const normalizedQuery = normalizeQuery(query);
  if (normalizedQuery.length < MIN_ADDRESS_SEARCH_LENGTH) {
    return { items: [], error: "INVALID_INPUT" };
  }

  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (!isValidCountryCode(normalizedCountryCode)) {
    return { items: [], error: "INVALID_INPUT" };
  }

  // No need to normalize language since the client should send exactly "en" or "fr"
  if (!isValidLanguage(language)) {
    return { items: [], error: "INVALID_INPUT" };
  }

  // Avoid showing find results if rate limited
  if (await checkRateLimited(await getClientIp())) {
    return { items: [], error: "RATE_LIMITED" };
  }

  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&SearchTerm=" + encodeURIComponent(normalizedQuery);
  params += "&Country=" + encodeURIComponent(normalizedCountryCode);
  params += "&LanguagePreference=" + encodeURIComponent(language);

  try {
    const response = await fetch(autoCompleteUrl + params, {
      headers: { "content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Received non-OK response: ${response.status}`);
    }

    const responseData = await response.json();

    if (hasItems0Error(responseData)) {
      return { items: [], error: "SERVICE_UNAVAILABLE" };
    }

    return { items: (responseData?.Items as AddressCompleteChoice[]) || [], error: null };
  } catch (err: unknown) {
    logMessage.warn(
      `AddressComplete API request failed. Reason: ${err instanceof Error ? err.message : String(err)}`
    );
    return { items: [], error: "NETWORK_ERROR" };
  }
};

// Functions returns the selected address.
export const getSelectedAddress = async (
  value: string,
  countryCode: string,
  language: Language
): Promise<{ address: AddressElements | null; error?: string | null }> => {
  if (!addressCompleteKey) {
    return { address: null, error: "API_KEY_MISSING" };
  }

  const normalizedCanadaPostId = normalizeAddressField(value);
  if (!isValidCanadaPostId(normalizedCanadaPostId)) {
    return { address: null, error: "INVALID_INPUT" };
  }

  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (!isValidCountryCode(normalizedCountryCode)) {
    return { address: null, error: "INVALID_INPUT" };
  }

  if (!isValidLanguage(language)) {
    return { address: null, error: "INVALID_INPUT" };
  }

  // Increment the rate limit for paid Retrieve requests
  if (await incrementAndCheckRateLimiting(await getClientIp())) {
    return { address: null, error: "RATE_LIMITED" };
  }

  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&Id=" + encodeURIComponent(normalizedCanadaPostId);
  params += "&Country=" + encodeURIComponent(normalizedCountryCode);
  params += "&LanguagePreference=" + encodeURIComponent(language);

  try {
    const response = await fetch(retriveAddressUrl + params, {
      headers: { "content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Received non-OK response: ${response.status}`);
    }

    const responseData = await response.json();

    if (hasItems0Error(responseData)) {
      return { address: null, error: "SERVICE_UNAVAILABLE" };
    }

    const addressData = responseData?.Items as AddressCompleteResult[];

    const addressComponents = await getAddressComponents(addressData, language);

    return { address: addressComponents, error: null };
  } catch (err: unknown) {
    logMessage.warn(
      `AddressComplete API request failed. Reason: ${err instanceof Error ? err.message : String(err)}`
    );
    return { address: null, error: "NETWORK_ERROR" };
  }
};

// Function returns the address set from a retreive.
export const getAddressCompleteRetrieve = async (
  query: string,
  countryCode: string,
  language: string
): Promise<{ items: AddressCompleteChoice[]; error?: string | null }> => {
  if (!addressCompleteKey) {
    return { items: [], error: "API_KEY_MISSING" };
  }

  const normalizedQuery = normalizeQuery(query);
  if (!isValidCanadaPostId(normalizedQuery)) {
    return { items: [], error: "INVALID_INPUT" };
  }

  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (!isValidCountryCode(normalizedCountryCode)) {
    return { items: [], error: "INVALID_INPUT" };
  }

  if (!isValidLanguage(language)) {
    return { items: [], error: "INVALID_INPUT" };
  }

  // Check the existing rate limit for free Find requests
  if (await checkRateLimited(await getClientIp())) {
    return { items: [], error: "RATE_LIMITED" };
  }

  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&LastId=" + encodeURIComponent(normalizedQuery);
  params += "&Country=" + encodeURIComponent(normalizedCountryCode);
  params += "&LanguagePreference=" + encodeURIComponent(language);

  try {
    const response = await fetch(autoCompleteUrl + params, {
      headers: { "content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Received non-OK response: ${response.status}`);
    }

    const responseData = await response.json(); //Todo #4341  - Error Handling

    if (hasItems0Error(responseData)) {
      return { items: [], error: "SERVICE_UNAVAILABLE" };
    }

    return { items: (responseData?.Items as AddressCompleteChoice[]) || [], error: null };
  } catch (err: unknown) {
    logMessage.warn(
      `AddressComplete API request failed. Reason: ${err instanceof Error ? err.message : String(err)}`
    );
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

const nestedAddressPattern = /\s+-\s+\d+\s+(Addresses|Adresses)$/i;

// Helper function to test if the address has multiple results.
// -- ref: Issue #4464, Issue #4417
// This helper exists because the AddressComplete API has arbitrary returning of if an Address is Nested or not.
// This is usually determined by the
//    Next: AddressCompleNext;
//    Retrieve for a regular address or Find for a Nested.
// Eg: Typing in 'King St W, Toro' may return 'Retrieve' for all the auto complete values but it provides nested addresses.
export async function matchesAddressPattern(input: string): Promise<boolean> {
  return nestedAddressPattern.test(input);
}
