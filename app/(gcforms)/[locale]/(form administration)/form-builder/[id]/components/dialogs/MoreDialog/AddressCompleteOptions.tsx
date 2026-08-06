"use client";
import { useTranslation } from "@i18n/client";
import { Radio } from "@formBuilder/components/shared/MultipleChoice";
import { FormElementTypes, FormElement } from "@lib/types";

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

  const isCanadianOnly = item.properties.addressComponents?.canadianOnly ?? true;
  const isSplitAddress = item.properties.addressComponents?.splitAddress ?? false;

  return (
    <section className="mb-4">
      <h3>{t("addElementDialog.addressComplete.options")}</h3>

      <Radio
        id={`addressComponent-${item.id}-id-international`}
        value={false}
        checked={!isCanadianOnly}
        name={`addressComponent-${item.id}-name-canadianOnly`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              addressComponents: {
                ...item.properties.addressComponents,
                canadianOnly: !e.target.checked,
              },
            },
          });
        }}
        label={t("addElementDialog.addressComplete.allowInternational")}
      ></Radio>
      <Radio
        id={`addressComponent-${item.id}-id-canadianOnly`}
        value={true}
        checked={isCanadianOnly}
        name={`addressComponent-${item.id}-name-canadianOnly`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              addressComponents: {
                ...item.properties.addressComponents,
                canadianOnly: e.target.checked,
              },
            },
          });
        }}
        label={t("addElementDialog.addressComplete.canadianOnly")}
      ></Radio>

      <h4 className="mt-4">{t("addElementDialog.addressComplete.fields")}</h4>
      <p className="mt-2 mb-4">{t("addElementDialog.addressComplete.fieldsDesc")}</p>

      <Radio
        className="mt-2"
        name={`addressType-${item.id}`}
        id="addressType-full"
        label={t("addElementDialog.addressComplete.fullAddress")}
        value={false}
        checked={!isSplitAddress}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              addressComponents: {
                ...item.properties.addressComponents,
                splitAddress: !e.target.checked,
              },
            },
          });
        }}
      />
      <div className="mb-4 ml-12 text-sm">
        {t("addElementDialog.addressComplete.fullAddressDesc")}
      </div>
      <Radio
        className="mt-2"
        name={`addressType-${item.id}`}
        id="addressType-split"
        label={t("addElementDialog.addressComplete.splitAddress")}
        value={true}
        checked={isSplitAddress}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              addressComponents: {
                ...item.properties.addressComponents,
                splitAddress: e.target.checked,
              },
            },
          });
        }}
      />
      <div className="mb-4 ml-12 text-sm">
        {t("addElementDialog.addressComplete.splitAddressDesc")}
      </div>
    </section>
  );
};
