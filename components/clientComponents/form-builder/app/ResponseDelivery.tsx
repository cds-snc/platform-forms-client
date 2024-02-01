"use client";
import React, { useEffect } from "react";

import { SetResponseDelivery } from "./SetResponseDelivery";
import { LoggedOutTabName, LoggedOutTab } from "./LoggedOutTab";
import { useTemplateContext } from "../hooks";
import { useTemplateStore } from "../store";

export const ResponseDelivery = () => {
  const { saveForm } = useTemplateContext();

  const hasHydrated = useTemplateStore((s) => s.hasHydrated);

  // auto save form if authenticated and not saved
  useEffect(() => {
    if (hasHydrated) {
      saveForm();
    }
  }, [saveForm, hasHydrated]);

  useEffect(() => {
    // storeRef.persist.rehydrate();
  }, []);

  if (!hasHydrated) return null;

  return (
    <>
      <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />
      <SetResponseDelivery />
    </>
  );
};
