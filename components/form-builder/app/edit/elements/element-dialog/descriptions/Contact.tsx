import React from "react";
import { useTranslation } from "next-i18next";
import { RadioEmptyIcon } from "@components/form-builder/icons";

const Text = ({ label, description }: { label: string; description?: string }) => {
  return (
    <div className="ml-1">
      <p className="mb-1 font-bold mt-1 text-sm">{label}</p>
      {description && <p className="mb-2 text-sm">{description}</p>}
      <div className="w-[350px] h-[40px] rounded border-black-default border-2 p-1 mb-2" />
    </div>
  );
};

export const Contact = ({ title }: { title: string }) => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="font-bold text-[1.5rem] mb-2">{title}</h3>
      <Text
        label={t("addElementDialog.contact.phone.label")}
        description={t("addElementDialog.contact.phone.description")}
      />
      <Text
        label={t("addElementDialog.contact.email.label")}
        description={t("addElementDialog.contact.email.description")}
      />

      <h3 className="mb-0 mt-8 text-[1.5rem]">{t("addElementDialog.contact.language.label")}</h3>
      <div className="mt-8 ml-1">
        <div className="flex flex-col">
          <div className="flex mb-5">
            <div>
              <RadioEmptyIcon className="scale-150" />
            </div>
            <div className="-mt-1 ml-5">{t("addElementDialog.contact.language.english")}</div>
          </div>
          <div className="flex mb-5">
            <div>
              <RadioEmptyIcon className="scale-150" />
            </div>
            <div className="-mt-1 ml-5">{t("addElementDialog.contact.language.french")}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
