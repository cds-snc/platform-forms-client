import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";

export const useFormValuesChanged = () => {
  const { values } = useFormikContext();
  const { updateValues } = useGCFormsContext();

  useEffect(() => {
    updateValues({ formValues: values as Record<string, string> });
  }, [updateValues, values]);
};
