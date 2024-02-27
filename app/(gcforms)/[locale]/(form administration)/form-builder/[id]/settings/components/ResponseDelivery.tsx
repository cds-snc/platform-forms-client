"use client";
import React, { useEffect } from "react";

import { SetResponseDelivery } from "./SetResponseDelivery";
import { useTemplateContext, useRehydrate } from "@lib/hooks/form-builder";

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
      <SetResponseDelivery />
    </>
  );
};
