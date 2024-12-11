import { useTranslation } from "@i18n/client";
import { FormItem } from "../../helpers";
import {
  AddressCompleteLabels,
  AddressElements,
} from "@clientComponents/forms/AddressComplete/types";
import { Language } from "@lib/types/form-builder-types";
import { AddressComponents } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { safeJSONParse } from "@lib/utils";
import { BaseElementArray } from "../BaseElementArray";
import { BaseElement } from "../BaseElement";
import { getCombinedAddressAsFormItem, getSplitAddressAsFormItem } from "./helpers";

export const AddressComplete = ({
  formItem,
  language,
}: {
  formItem: FormItem;
  language: Language;
}): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { getValues } = useGCFormsContext();

  const formValues = getValues();
  const element = formItem.originalFormElement;
  const addressComponents = element?.properties?.addressComponents as AddressComponents;
  const elementId = element?.id; // For TS next line...
  const addressFormValue = formValues[elementId as keyof typeof elementId];
  const addressValues = safeJSONParse(addressFormValue) as AddressElements; // TODO or should an error be thrown or handled?

  if (addressComponents.splitAddress) {
    const addressCompleteStrings = {
      streetAddress: t("addressComponents.streetName", { lng: language }),
      city: t("addressComponents.city", { lng: language }),
      province: t("addressComponents.province", { lng: language }),
      postalCode: t("addressComponents.postalCode", { lng: language }),
      provinceOrState: t("addressComponents.provinceOrState", { lng: language }),
      postalCodeOrZip: t("addressComponents.postalCodeOrZip", { lng: language }),
      country: t("addressComponents.country", { lng: language }),
    } as AddressCompleteLabels;
    const splitAddress = getSplitAddressAsFormItem(
      element,
      addressValues,
      language,
      addressCompleteStrings
    );
    return (
      <div className="mb-8">
        {splitAddress &&
          splitAddress.map((addressAsFormItem, index) => (
            <BaseElement
              key={`${addressAsFormItem.originalFormElement.id}-${index}`}
              formItem={addressAsFormItem}
            />
          ))}
      </div>
    );
  }

  const combinedAddress = getCombinedAddressAsFormItem(element, addressValues, language);
  return <BaseElementArray formItem={combinedAddress} />;
};
