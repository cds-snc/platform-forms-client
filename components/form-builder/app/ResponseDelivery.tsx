import React, { useEffect } from "react";

import { useTranslation } from "next-i18next";

import { SetResponseDelivery } from "./SetResponseDelivery";
import { LoggedOutTabName, LoggedOutTab } from "./LoggedOutTab";
import { useTemplateContext } from "../hooks";

export const ResponseDelivery = () => {
  const { t } = useTranslation("form-builder");
  const { saveForm } = useTemplateContext();

  // auto save form if authenticated and not saved
  useEffect(() => {
    saveForm();
  }, [saveForm]);

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />
      <SetResponseDelivery />
    </>
  );
};
