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
      <h3>{t("moreDialog.addressComplete.addressOptions")}</h3>
      <p className="mt-4 font-semibold">{t("moreDialog.addressComplete.typeOfAddress")}</p>

      <Radio
        className="mt-2"
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
        label={t("moreDialog.addressComplete.allowInternational")}
      ></Radio>
      <Radio
        className="mt-2"
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
        label={t("moreDialog.addressComplete.canadianOnly")}
      ></Radio>

      <h4 className="mt-4">{t("moreDialog.addressComplete.format")}</h4>

      <Radio
        className="mt-2"
        name={`addressType-${item.id}`}
        id="addressType-full"
        label={t("moreDialog.addressComplete.fullAddress")}
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
      <div className="mb-4 ml-12 text-sm">{t("moreDialog.addressComplete.fullAddressDesc")}</div>
      <Radio
        className="mt-2"
        name={`addressType-${item.id}`}
        id="addressType-split"
        label={t("moreDialog.addressComplete.splitAddress")}
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
      <div className="mb-4 ml-12 text-sm">{t("moreDialog.addressComplete.splitAddressDesc")}</div>
    </section>
  );
};
