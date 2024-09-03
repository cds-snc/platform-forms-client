"use client";
import { AddressCompleteChoice, AddressCompleteResult, AddressElements } from "./types";

const autoCompleteUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/AutoComplete/v1.00/json3.ws";
const retriveAddressUrl =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/RetrieveById/v1.00/json3.ws";

// Function returns address complete list of choices.
export const getAddressCompleteChoices = async (query: string) => {
  // The server returns a promise, so we need to await it, Lint thinks it isn't one for some reason.
  const addressCompleteKey = process.env.NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY ?? ""; // eslint-disable-line

  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&SearchTerm=" + encodeURIComponent(query);
  params += "&Country=" + encodeURIComponent("CAN");

  const response = await fetch(autoCompleteUrl + params, {
    headers: { "content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  const responseData = await response.json(); //Todo - Error Handling

  return responseData.Items as AddressCompleteChoice[];
};

// Functions returns the selected address.
export const getSelectedAddress = async (value: string) => {
  // The server returns a promise, so we need to await it, Lint thinks it isn't one for some reason.
  const addressCompleteKey = process.env.NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY ?? ""; // eslint-disable-line

  const selectedResult = value;
  let params = "?";
  params += "Key=" + encodeURIComponent(addressCompleteKey);
  params += "&Id=" + encodeURIComponent(selectedResult);
  params += "&Country=" + encodeURIComponent("CAN");

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

  const address = {
    unitNumber: unitNumberData?.FormattedValue,
    civicNumber: civicNumberData?.FormattedValue,
    streetName: streetNameData?.FormattedValue,
    city: cityData?.FormattedValue,
    province: provinceData?.FormattedValue,
    postalCode: postalData?.FormattedValue,
    country: "Canada",
  };

  return address as AddressElements;
};
