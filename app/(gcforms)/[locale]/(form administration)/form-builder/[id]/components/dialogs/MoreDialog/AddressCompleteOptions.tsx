"use client";
import { useTranslation } from "@i18n/client";
import { Checkbox, Radio } from "@formBuilder/components/shared";
// import { ElementProperties, AddressComponents } from "@lib/types";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

export const AddressCompleteOptions = ({
  item,
}: // updateModalProperties,
{
  item: FormElementWithIndex;
  // updateModalProperties: (id: number, properties: ElementProperties) => void;
}) => {
  const { t } = useTranslation("form-builder");

  //   const updateAddressComponents = (props: AddressComponents) => {
  //     // check if the addresscomponent exists, if it doesn't make it.
  //     if (item.properties.addressComponents == undefined) {
  //       const baseAddress = {} as AddressComponents;
  //       const addressComponent = Object.assign({}, baseAddress, props);
  //       updateModalProperties(item.id, { ...properties, addressComponents: addressComponent });
  //     } else {
  //       // clone the existing properties so that we don't overwrite other keys in "validation"
  //       const addressComponent = Object.assign(
  //         {},
  //         item.properties.addressComponents,
  //         props
  //       ) as AddressComponents;
  //       updateModalProperties(item.id, { ...properties, addressComponents: addressComponent });
  //     }
  //   };

  return (
    <section className="mb-4">
      <h3>{t("addElementDialog.addressComplete.options")}</h3>

      <Checkbox
        id={`addressComponent-${item.index}-id-canadianOnly`}
        value={
          `addressComponent-${item.index}-value-canadianOnly-` +
          item.properties.addressComponents?.canadianOnly
        }
        key={
          `addressComponent-${item.index}-canadianOnly-` +
          item.properties.addressComponents?.canadianOnly
        }
        defaultChecked={item.properties.addressComponents?.canadianOnly}
        // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        //   //   updateAddressComponents({ canadianOnly: e.target.checked });
        // }}
        label={t("addElementDialog.addressComplete.canadianOnly")}
      ></Checkbox>

      <h4 className="mt-4">{t("addElementDialog.addressComplete.fields")}</h4>
      <p className="mt-2 mb-4">{t("addElementDialog.addressComplete.fieldsDesc")}</p>

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
        // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        //   //   updateAddressComponents({ splitAddress: !e.target.checked });
        // }}
      />
      <div className="text-sm ml-12 mb-4">
        {t("addElementDialog.addressComplete.fullAddressDesc")}
      </div>
      <Radio
        className="mt-2"
        name="addressType"
        id="addressType-split"
        label={t("addElementDialog.addressComplete.splitAddress")}
        value="addressType-split"
        checked={item.properties.addressComponents?.splitAddress === true}
        // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        //   //   updateAddressComponents({ splitAddress: e.target.checked });
        // }}
      />
      <div className="text-sm ml-12 mb-4">
        {t("addElementDialog.addressComplete.splitAddressDesc")}
      </div>
    </section>
  );
};
