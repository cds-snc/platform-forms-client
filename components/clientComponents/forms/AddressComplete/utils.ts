import { FormElement } from "@lib/types";
import { AddressCompleteChoice, AddressCompleteResult, AddressElements } from "./types";
import { Answer } from "@lib/responseDownloadFormats/types";

const autoCompleteUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/AutoComplete/v1.00/json3.ws";
const retriveAddressUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/RetrieveById/v1.00/json3.ws";

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

  const responseData = await response.json(); //Todo - Error Handling

  return responseData.Items as AddressCompleteChoice[];
};

// Functions returns the selected address.
export const getSelectedAddress = async (
  addressCompleteKey: string,
  value: string,
  countryCode: string
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

  const responseData = await response.json(); //Todo - Error Handling
  const addressData = responseData.Items as AddressCompleteResult[];
  const addressComponents = await getAddressComponents(addressData);
  return addressComponents;
};

// Helper function combines API component results into single address object.
export const getAddressComponents = async (addressCompleteResult: AddressCompleteResult[]) => {
  const civicNumberData = addressCompleteResult.find((obj: AddressCompleteResult) => {
    return obj.FieldGroup === "Country" && obj.FieldName === "StreetNumber";
  });

  const unitNumberData = addressCompleteResult.find((obj: AddressCompleteResult) => {
    return obj.FieldGroup === "Common" && obj.FieldName === "SubBuilding";
  });

  const streetNameData = addressCompleteResult.find((obj: AddressCompleteResult) => {
    return obj.FieldGroup === "Country" && obj.FieldName === "StreetName";
  });

  const cityData = addressCompleteResult.find((obj: AddressCompleteResult) => {
    return obj.FieldGroup === "Common" && obj.FieldName === "City";
  });

  const provinceData = addressCompleteResult.find((obj: AddressCompleteResult) => {
    return obj.FieldGroup === "Common" && obj.FieldName === "ProvinceCode";
  });

  const postalData = addressCompleteResult.find((obj: AddressCompleteResult) => {
    return obj.FieldGroup === "Common" && obj.FieldName === "PostalCode";
  });

  const streetAddress =
    (unitNumberData?.FormattedValue ? unitNumberData?.FormattedValue + "-" : "") +
    civicNumberData?.FormattedValue +
    " " +
    streetNameData?.FormattedValue;
  const address = {
    streetAddress: streetAddress,
    city: cityData?.FormattedValue,
    province: provinceData?.FormattedValue,
    postalCode: postalData?.FormattedValue,
    country: "Canada",
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
      title: titleSet[key as keyof AddressElements],
      values: address[key as keyof AddressElements],
      element: element,
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
