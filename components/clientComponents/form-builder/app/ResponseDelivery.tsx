"use client";
import React, { useEffect } from "react";

import { SetResponseDelivery } from "./SetResponseDelivery";
import { LoggedOutTabName, LoggedOutTab } from "./LoggedOutTab";
import { useTemplateContext, useRehydrate } from "../hooks";

export const ResponseDelivery = () => {
  const { saveForm } = useTemplateContext();
  const hasHydrated = useRehydrate();

  // auto save form if authenticated and not saved
  useEffect(() => {
    if (hasHydrated) {
      saveForm();
    }
  }, [saveForm, hasHydrated]);

  if (!hasHydrated) return null;

  return (
    <>
      <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />
      <SetResponseDelivery />
    </>
  );
};
