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

export const Name = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <Text
        label={t("addElementDialog.name.label")}
        description={t("addElementDialog.name.description")}
      />
    </div>
  );
};
