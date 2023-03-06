import React from "react";
import { useTranslation } from "next-i18next";

const Text = ({ label, description }: { label: string; description?: string }) => {
  return (
    <div className="ml-1">
      <p className="mb-1 font-bold mt-1 text-sm">{label}</p>
      {description && <p className="mb-2 text-sm">{description}</p>}
      <div className="w-[350px] h-[40px] rounded border-black-default border-2 p-1 mb-2" />
    </div>
  );
};

export const Address = ({ title }: { title: string }) => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <div className="font-bold text-[1.5rem] mb-2">{title}</div>
      <Text
        label={t("addElementDialog.address.street.label")}
        description={t("addElementDialog.address.street.description")}
      />
      <Text label={t("addElementDialog.address.city")} />
      <Text label={t("addElementDialog.address.province")} />
      <Text label={t("addElementDialog.address.country")} />
      <Text label={t("addElementDialog.address.postal")} />
    </div>
  );
};
