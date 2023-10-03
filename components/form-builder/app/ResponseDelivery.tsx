import React, { useEffect } from "react";

import { useTranslation } from "next-i18next";

import { SetResponseDelivery } from "./SetResponseDelivery";
import { LoggedOutTabName, LoggedOutTab } from "./LoggedOutTab";
import { useTemplateContext } from "../hooks";

export const ResponseDelivery = () => {
  const { saveForm } = useTemplateContext();

  // auto save form if authenticated and not saved
  useEffect(() => {
    saveForm();
  }, [saveForm]);

  return (
    <>
      <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />
      <SetResponseDelivery />
    </>
  );
};
