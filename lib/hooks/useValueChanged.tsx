import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";

export const useFormValuesChanged = () => {
  const { values, setFieldValue } = useFormikContext();
  const { updateValues, currentGroup } = useGCFormsContext();

  useEffect(() => {
    updateValues({ formValues: values as Record<string, string> });
    setFieldValue("currentGroup", currentGroup);
  }, [updateValues, values, setFieldValue, currentGroup]);
};
