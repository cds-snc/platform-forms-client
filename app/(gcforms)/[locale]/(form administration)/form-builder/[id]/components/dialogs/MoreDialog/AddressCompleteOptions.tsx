"use client";
import { useTranslation } from "@i18n/client";
import { Checkbox, Radio } from "@formBuilder/components/shared/MultipleChoice";
import { AddressComponents, FormElement, FormElementTypes } from "@lib/types";

export const AddressCompleteOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  if (item.type !== FormElementTypes.addressComplete) {
    return null;
  }

  const updateAddressComponents = (props: AddressComponents) => {
    // check if the addresscomponent exists, if it doesn't make it.
    if (item.properties.addressComponents == undefined) {
      const baseAddress = {} as AddressComponents;
      const addressComponent = Object.assign({}, baseAddress, props);
      setItem({
        ...item,
        properties: { ...item.properties, addressComponents: addressComponent },
      });
    } else {
      // clone the existing properties so that we don't overwrite other keys in "validation"
      const addressComponent = Object.assign(
        {},
        item.properties.addressComponents,
        props
      ) as AddressComponents;
      setItem({
        ...item,
        properties: { ...item.properties, addressComponents: addressComponent },
      });
    }
  };

  return (
    <section className="mb-4">
      <h3>{t("addElementDialog.addressComplete.options")}</h3>

      <Checkbox
        id={`addressComponent-${item.id}-id-canadianOnly`}
        value={
          `addressComponent-${item.id}-value-canadianOnly-` +
          item.properties.addressComponents?.canadianOnly
        }
        key={
          `addressComponent-${item.id}-canadianOnly-` +
          item.properties.addressComponents?.canadianOnly
        }
        defaultChecked={item.properties.addressComponents?.canadianOnly}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ canadianOnly: e.target.checked });
        }}
        label={t("addElementDialog.addressComplete.canadianOnly")}
      ></Checkbox>

      <h4 className="mt-4">{t("addElementDialog.addressComplete.fields")}</h4>
      <p className="mb-4 mt-2">{t("addElementDialog.addressComplete.fieldsDesc")}</p>

      <Radio
        className="mt-2"
        name="addressType"
        id="addressType-full"
        label={t("addElementDialog.addressComplete.fullAddress")}
        value="addressType-full"
        checked={
          item.properties.addressComponents?.splitAddress === false ||
          item.properties.addressComponents?.splitAddress === undefined
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ splitAddress: !e.target.checked });
        }}
      />
      <div className="mb-4 ml-12 text-sm">
        {t("addElementDialog.addressComplete.fullAddressDesc")}
      </div>
      <Radio
        className="mt-2"
        name="addressType"
        id="addressType-split"
        label={t("addElementDialog.addressComplete.splitAddress")}
        value="addressType-split"
        checked={item.properties.addressComponents?.splitAddress === true}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ splitAddress: e.target.checked });
        }}
      />
      <div className="mb-4 ml-12 text-sm">
        {t("addElementDialog.addressComplete.splitAddressDesc")}
      </div>
    </section>
  );
};
