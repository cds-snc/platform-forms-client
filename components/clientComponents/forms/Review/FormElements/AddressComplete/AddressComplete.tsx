import { useTranslation } from "@i18n/client";
import { FormItem } from "../../helpers";
import {
  AddressCompleteLabels,
  AddressElements,
} from "@clientComponents/forms/AddressComplete/types";
import { Language } from "@lib/types/form-builder-types";
import { AddressComponents } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { getLocalizedProperty, safeJSONParse } from "@lib/utils";
import { BaseElementArray } from "../BaseElementArray";
import { BaseElement } from "../BaseElement";
import { getCombinedAddressAsFormItem, getSplitAddressAsFormItem } from "./helpers";

// TODO: Fix Canada not showing up in the output (other countries do) - on staging as well

export const AddressComplete = ({
  formItem,
  language,
  forceSplitAddress = false,
}: {
  formItem: FormItem;
  language: Language;
  forceSplitAddress?: boolean;
}): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { getValues } = useGCFormsContext();

  const formValues = getValues();
  const element = formItem.element;
  const addressComponents = element?.properties?.addressComponents as AddressComponents;
  const elementId = element?.id; // For TS next line...
  const addressFormValue = formValues[elementId as keyof typeof elementId];
  const addressValues = safeJSONParse(addressFormValue) as AddressElements;

  if (addressComponents?.splitAddress || forceSplitAddress) {
    const addressCompleteStrings = {
      streetAddress: t("addressComponents.streetName", { lng: language }),
      city: t("addressComponents.city", { lng: language }),
      province: t("addressComponents.province", { lng: language }),
      postalCode: t("addressComponents.postalCode", { lng: language }),
      provinceOrState: t("addressComponents.provinceOrState", { lng: language }),
      postalCodeOrZip: t("addressComponents.postalCodeOrZip", { lng: language }),
      country: t("addressComponents.country", { lng: language }),
    } as AddressCompleteLabels;

    const splitAddress = getSplitAddressAsFormItem(element, addressValues, addressCompleteStrings);

    return (
      <div className="mb-8">
        <h4>{String(element?.properties?.[getLocalizedProperty("title", language)])}</h4>
        {splitAddress &&
          splitAddress.map((addressAsFormItem, index) => (
            <BaseElement
              key={`${addressAsFormItem.element.id}-${index}`}
              formItem={addressAsFormItem}
            />
          ))}
      </div>
    );
  }

  const combinedAddress = getCombinedAddressAsFormItem(element, addressValues, language);
  return <BaseElementArray formItem={combinedAddress} />;
};
