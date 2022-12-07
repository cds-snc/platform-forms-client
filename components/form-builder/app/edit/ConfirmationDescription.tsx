import React from "react";
import { useTranslation } from "next-i18next";

export const ConfirmationDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-8 text-[1rem]">
      <p>{t("confirmationDescriptionParagraph")}</p>
      <ul className="mt-2 mb-2">
        <li>{t("confirmationDescriptionItem1")}</li>
        <li>{t("confirmationDescriptionItem2")}</li>
        <li>{t("confirmationDescriptionItem3")}</li>
        <li>{t("confirmationDescriptionItem4")}</li>
      </ul>
    </div>
  );
};
