import {
  type AddressCompleteLabels,
  type AddressElements,
} from "@clientComponents/forms/AddressComplete/types";
import { type Language } from "@lib/types/form-builder-types";
import { type AddressComponents } from "@lib/types";
import { FormItem } from "../../helpers";
import { getLocalizedProperty, safeJSONParse } from "@lib/utils";
import { BaseElementArray } from "../BaseElementArray";
import { BaseElement } from "../BaseElement";
import { getCombinedAddressAsFormItem, getSplitAddressAsFormItem } from "./helpers";
import { customTranslate } from "@lib/i18nHelpers";

export const AddressComplete = ({
  formItem,
  language,
  splitValues = false,
}: {
  formItem: FormItem;
  language: Language;
  splitValues?: boolean;
}): React.ReactElement => {
  const { t } = customTranslate("review");
  const element = formItem.element;
  const addressComponents = element?.properties?.addressComponents as AddressComponents;
  const addressFormValue = formItem.values;
  const addressValues = safeJSONParse(addressFormValue as string) as AddressElements;

  if (addressComponents?.splitAddress || splitValues) {
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
