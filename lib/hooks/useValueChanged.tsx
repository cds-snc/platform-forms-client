"use client";
import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";

export const useFormValuesChanged = () => {
  const { values, setFieldValue } = useFormikContext();
  const { updateValues, currentGroup } = useGCFormsContext();

  useEffect(() => {
    if (process.env.APP_ENV === "test") {
      // skip for test env
      return;
    }

    updateValues({ formValues: values as Record<string, string> });
    setFieldValue("currentGroup", currentGroup);
  }, [updateValues, values, setFieldValue, currentGroup]);
};
