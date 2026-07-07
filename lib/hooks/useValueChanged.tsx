"use client";
import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";

// Updates the GCFormsContext with latest values and triggers logic
export const useFormValuesChanged = () => {
  const { values, setFieldValue } = useFormikContext();
  const { updateValues } = useGCFormsContext();

  useEffect(() => {
    if (process.env.APP_ENV === "test") {
      // skip for test env
      return;
    }
    updateValues({ formValues: values as Record<string, string> });
  }, [updateValues, values, setFieldValue]);
};
