import { FormElement, FormElementTypes } from "@lib/types";
import {
  AddressCompleteLabels,
  AddressElements,
} from "@clientComponents/forms/AddressComplete/types";
import { Language } from "@lib/types/form-builder-types";
import { getLocalizedProperty } from "@lib/utils";
import { getAddressAsReviewElements } from "@clientComponents/forms/AddressComplete/utils";
import { FormItem } from "../../helpers";

export const getCombinedAddressAsFormItem = (
  element: FormElement | undefined,
  addressValues: AddressElements,
  language: Language
) => {
  if (!element) {
    return;
  }

  const parentTitle = element?.properties?.[getLocalizedProperty("title", language)];
  // TODO just use Object.values() instead
  const addressValuesCombined = Object.keys(addressValues).map(
    (key) => addressValues[key as keyof typeof addressValues]
  );

  return {
    type: FormElementTypes.textField,
    label: parentTitle,
    values: addressValuesCombined,
    originalFormElement: element,
  } as FormItem;
};

export const getSplitAddressAsFormItem = (
  element: FormElement | undefined,
  addressValues: AddressElements,
  language: Language,
  addressCompleteStrings: AddressCompleteLabels
) => {
  if (!element) {
    return;
  }

  const parentTitle = element?.properties?.[getLocalizedProperty("title", language)];
  const canadaOnly = element.properties.addressComponents?.canadianOnly;
  const titleSet = {
    streetAddress: `${parentTitle} - ${addressCompleteStrings.streetAddress}`,
    city: `${parentTitle} - ${addressCompleteStrings.city}`,
    province: `${parentTitle} - 
      ${canadaOnly ? addressCompleteStrings.province : addressCompleteStrings.provinceOrState}`,
    postalCode: `${parentTitle} - ${
      canadaOnly ? addressCompleteStrings.postalCode : addressCompleteStrings.postalCodeOrZip
    }`,
    country: `${parentTitle} - ${addressCompleteStrings.country}`,
  };

  return getAddressAsReviewElements(addressValues, element, titleSet);
};
