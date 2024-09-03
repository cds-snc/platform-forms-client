"use client";
import { useTranslation } from "@i18n/client";
import { Checkbox, Radio } from "@formBuilder/components/shared";
import { ElementProperties, AddressComponents } from "@lib/types";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

export const AddressCompleteOptions = ({
  item,
  properties,
  updateModalProperties,
}: {
  item: FormElementWithIndex;
  properties: ElementProperties;
  updateModalProperties: (id: number, properties: ElementProperties) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const updateAddressComponents = (props: AddressComponents) => {
    // check if the addresscomponent exists, if it doesn't make it.
    if (properties.addressComponents == undefined) {
      const baseAddress = {} as AddressComponents;
      const addressComponent = Object.assign({}, baseAddress, props);
      updateModalProperties(item.id, { ...properties, addressComponents: addressComponent });
    } else {
      // clone the existing properties so that we don't overwrite other keys in "validation"
      const addressComponent = Object.assign(
        {},
        properties.addressComponents,
        props
      ) as AddressComponents;
      updateModalProperties(item.id, { ...properties, addressComponents: addressComponent });
    }
  };

  return (
    <section className="mb-4">
      <h3>{t("addElementDialog.addressComplete.options")}</h3>
      <h4>{t("addElementDialog.addressComplete.fields")}</h4>
      <p className="mt-4 mb-4">{t("addElementDialog.addressComplete.fieldsDesc")}</p>

      <Radio
        className="mt-2"
        name="addressType"
        id="addressType-full"
        label={t("addElementDialog.addressComplete.fullAddress")}
        value=""
        checked={!properties.full}
        onChange={() => {
          updateModalProperties(item.id, {
            ...properties,
            ...{ full: true },
          });
        }}
      />
      <Radio
        className="mt-2"
        name="addressType"
        id="addressType-split"
        label={t("addElementDialog.addressComplete.splitAddress")}
        value="bday"
        checked={properties.full === false}
        onChange={() => {
          updateModalProperties(item.id, {
            ...properties,
            ...{ full: false },
          });
        }}
      />

      <h4>{t("addElementDialog.addressComplete.components.header")}</h4>
      <p className="mt-4 mb-4">{t("addElementDialog.addressComplete.components.desc")}</p>

      <Checkbox
        id={`addressComponent-${item.index}-id-unitNumber`}
        value={
          `addressComponent-${item.index}-value-unitNumber-` +
          properties.addressComponents?.unitNumber
        }
        key={
          `addressComponent-${item.index}-unitNumber-` + properties.addressComponents?.unitNumber
        }
        defaultChecked={properties.addressComponents?.unitNumber}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ unitNumber: e.target.checked });
        }}
        label={t("addElementDialog.addressComplete.components.unitNumber")}
      ></Checkbox>

      <Checkbox
        id={`addressComponent-${item.index}-id-civicNumber`}
        value={
          `addressComponent-${item.index}-value-civicNumber-` +
          properties.addressComponents?.civicNumber
        }
        key={
          `addressComponent-${item.index}-civicNumber-` + properties.addressComponents?.civicNumber
        }
        defaultChecked={properties.addressComponents?.civicNumber}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ civicNumber: e.target.checked });
        }}
        label={t("addElementDialog.addressComplete.components.civicNumber")}
      ></Checkbox>

      <Checkbox
        id={`addressComponent-${item.index}-id-streetName`}
        value={
          `addressComponent-${item.index}-value-streetName-` +
          properties.addressComponents?.streetName
        }
        key={
          `addressComponent-${item.index}-streetName-` + properties.addressComponents?.streetName
        }
        defaultChecked={properties.addressComponents?.streetName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ streetName: e.target.checked });
        }}
        label={t("addElementDialog.addressComplete.components.streetName")}
      ></Checkbox>

      <Checkbox
        id={`addressComponent-${item.index}-id-city`}
        value={`addressComponent-${item.index}-value-city-` + properties.addressComponents?.city}
        key={`addressComponent-${item.index}-city-` + properties.addressComponents?.city}
        defaultChecked={properties.addressComponents?.city}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ city: e.target.checked });
        }}
        label={t("addElementDialog.addressComplete.components.city")}
      ></Checkbox>

      <Checkbox
        id={`addressComponent-${item.index}-id-province`}
        value={
          `addressComponent-${item.index}-value-province-` + properties.addressComponents?.province
        }
        key={`addressComponent-${item.index}-province-` + properties.addressComponents?.province}
        defaultChecked={properties.addressComponents?.province}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ province: e.target.checked });
        }}
        label={t("addElementDialog.addressComplete.components.province")}
      ></Checkbox>

      <Checkbox
        id={`addressComponent-${item.index}-id-postalCode`}
        value={
          `addressComponent-${item.index}-value-postalCode-` +
          properties.addressComponents?.postalCode
        }
        key={
          `addressComponent-${item.index}-postalCode-` + properties.addressComponents?.postalCode
        }
        defaultChecked={properties.addressComponents?.postalCode}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ postalCode: e.target.checked });
        }}
        label={t("addElementDialog.addressComplete.components.postalCode")}
      ></Checkbox>

      <Checkbox
        id={`addressComponent-${item.index}-id-country`}
        value={
          `addressComponent-${item.index}-value-country-` + properties.addressComponents?.country
        }
        key={`addressComponent-${item.index}-country-` + properties.addressComponents?.country}
        defaultChecked={properties.addressComponents?.country}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateAddressComponents({ country: e.target.checked });
        }}
        label={t("addElementDialog.addressComplete.components.country")}
      ></Checkbox>
    </section>
  );
};
