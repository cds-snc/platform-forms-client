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
  const addressValuesCombined = Object.values(addressValues);

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

  const canadaOnly = element.properties.addressComponents?.canadianOnly;
  const titleSet = {
    streetAddress: `${addressCompleteStrings.streetAddress}`,
    city: `${addressCompleteStrings.city}`,
    province: `
      ${canadaOnly ? addressCompleteStrings.province : addressCompleteStrings.provinceOrState}`,
    postalCode: `${
      canadaOnly ? addressCompleteStrings.postalCode : addressCompleteStrings.postalCodeOrZip
    }`,
    country: `${addressCompleteStrings.country}`,
  };

  return getAddressAsReviewElements(addressValues, element, titleSet);
};
