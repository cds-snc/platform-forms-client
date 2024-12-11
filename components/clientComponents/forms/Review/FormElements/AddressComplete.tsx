import { useTranslation } from "@i18n/client";
import { FormItem } from "../helpers";
import { AddressCompleteLabels, AddressElements } from "@clientComponents/forms/AddressComplete/types";
import { Language } from "@lib/types/form-builder-types";
import { AddressComponents, FormElement, FormElementTypes } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { getLocalizedProperty } from "@lib/utils";
import { getAddressAsReviewElements } from "@clientComponents/forms/AddressComplete/utils";
import { BaseElementArray } from "./BaseElementArray";
import { BaseElement } from "./BaseElement";


export const AddressComplete = ({ formItem, language }: { formItem: FormItem; language: Language }): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { getValues } = useGCFormsContext();

  const formValues = getValues()
  const element =  formItem.originalFormElement;
  const addressComponents = element?.properties?.addressComponents as AddressComponents;
  const addressFormValue = formValues[element.id] as string;
  const addressValues = JSON.parse(addressFormValue) as AddressElements;

  const getCombinedAddress = (element: FormElement | undefined, addressValues: AddressElements) => {
    if (!element || !formValues) {
      return;
    }

    const parentTitle = element?.properties?.[getLocalizedProperty("title", language)];
    const addressValuesCombined = Object.keys(addressValues).map(key => addressValues[key])

    return {
      type: FormElementTypes.textField, // TODO  may want to add a default for string and another for array
      label: parentTitle,
      values: addressValuesCombined,
      originalFormElement: element,
    } as FormItem
  }

  // returns an array of Form Items
  const getSplitAddress = (element: FormElement | undefined, addressValues: AddressElements) => {
    if (!element || !formValues) {
      return;
    }

    const parentTitle = element?.properties?.[getLocalizedProperty("title", language)];
    const canadaOnly = element.properties.addressComponents?.canadianOnly;

    const addressCompleteStrings = {
      streetAddress: t("addressComponents.streetName", { lng: language }),
      city: t("addressComponents.city", { lng: language }),
      province: t("addressComponents.province", { lng: language }),
      postalCode: t("addressComponents.postalCode", { lng: language }),
      provinceOrState: t("addressComponents.provinceOrState", { lng: language }),
      postalCodeOrZip: t("addressComponents.postalCodeOrZip", { lng: language }),
      country: t("addressComponents.country", { lng: language }),
    } as AddressCompleteLabels;

    const titleSet = {
      streetAddress: `${parentTitle} - ${addressCompleteStrings.streetAddress}`,
      city: `${parentTitle} - ${addressCompleteStrings.city}`,
      province: `${parentTitle} - 
        ${
          canadaOnly ? addressCompleteStrings.province : addressCompleteStrings.provinceOrState
        }`,
      postalCode: `${parentTitle} - ${
        canadaOnly ? addressCompleteStrings.postalCode : addressCompleteStrings.postalCodeOrZip
      }`,
      country: `${parentTitle} - ${addressCompleteStrings.country}`,
    } 

    // TODO update function so can remove map
    return getAddressAsReviewElements(
      addressValues,
      element,
      titleSet
    ).map(subAddress => {
      return {
        type: FormElementTypes.textField,
        label: subAddress.title,
        values: subAddress.values,
        originalFormElement: subAddress.element,
      };
    });
  }

  if (!addressComponents) {
    return <></>;
  }

  if (addressComponents.splitAddress) {
    const splitAddress = getSplitAddress(element, addressValues);
    return (<div className="mb-8">
      {splitAddress && splitAddress.map((addressAsFormItem, index) => <BaseElement key={`${addressAsFormItem.originalFormElement.id}-${index}`} formItem={addressAsFormItem} />)}
    </div>)
  }

  const combinedAddress = getCombinedAddress(element, addressValues);
  return <BaseElementArray formItem={combinedAddress} />;
};
