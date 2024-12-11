import { FormElement, FormElementTypes } from "@lib/types";
import { AddressCompleteChoice, AddressCompleteResult, AddressElements } from "./types";
import { Answer } from "@lib/responseDownloadFormats/types";

const autoCompleteUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws";
const retriveAddressUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.11/json3.ws";

// Function returns address complete list of choices.
export const getAddressCompleteChoices = async (
  addressCompleteKey: string,
  query: string,
  countryCode: string
) => {
  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&SearchTerm=" + encodeURIComponent(query);
  params += "&Country=" + encodeURIComponent(countryCode);

  const response = await fetch(autoCompleteUrl + params, {
    headers: { "content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  const responseData = await response.json(); //Todo #4341  - Error Handling

  return responseData.Items as AddressCompleteChoice[];
};

// Functions returns the selected address.
export const getSelectedAddress = async (
  addressCompleteKey: string,
  value: string,
  countryCode: string,
  language: string
) => {
  const selectedResult = value;
  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&Id=" + encodeURIComponent(selectedResult);
  params += "&Country=" + encodeURIComponent(countryCode);

  const response = await fetch(retriveAddressUrl + params, {
    headers: { "content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  const responseData = await response.json(); //Todo #4341 - Error Handling

  const addressData = responseData.Items as AddressCompleteResult[];

  const addressComponents = await getAddressComponents(addressData, language);

  return addressComponents;
};

// Function returns the address set from a retreive.
export const getAddressCompleteRetrieve = async (
  addressCompleteKey: string,
  query: string,
  countryCode: string
) => {
  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&LastId=" + encodeURIComponent(query);
  params += "&Country=" + encodeURIComponent(countryCode);

  const response = await fetch(autoCompleteUrl + params, {
    headers: { "content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  const responseData = await response.json(); //Todo #4341  - Error Handling

  return responseData.Items as AddressCompleteChoice[];
};

// Helper function combines API component results into single address object.
export const getAddressComponents = async (
  addressCompleteResult: AddressCompleteResult[],
  language: string
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

export const getAddressAsString = (address: AddressElements) => {
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
      originalFormElement: element,
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
