import React from "react";
import { useTranslation } from "next-i18next";
import { SetResponseDelivery } from "./SetResponseDelivery";
import { SettingsLoggedOut } from "./SettingsLoggedOut";

export const ResponseDelivery = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      <SettingsLoggedOut />
      <SetResponseDelivery />
    </>
  );
};
