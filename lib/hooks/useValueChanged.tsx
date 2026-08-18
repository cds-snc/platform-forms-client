"use client";
import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";
import { useVisibilityContext } from "./useVisibilityContext";

/**
 * This is a workaround to allow setting custom values in the formik form values.
 * Steps:
 * 1. in this file set the value below using setFieldValue
 * 2. in FormBuilder.tsx getFormInitialValues() add the new value
 * 3. in Form.tsx add the new value to the FormProps interface
 * 4. in Form.tsx this new value will now be available in the formik form values.* (props to Tim :)
 */
export const useFormValuesChanged = () => {
  const { values, setFieldValue } = useFormikContext();
  const { updateValues, currentGroup, getGroupHistory, matchedIds } = useGCFormsContext();
  const { updateValues: updateVisibility } = useVisibilityContext();
  const groupHistory = getGroupHistory();
  const formValues = values as Record<string, unknown>;

  useEffect(() => {
    if (process.env.APP_ENV === "test") {
      // skip for test env
      return;
    }
    updateValues({ formValues: values as Record<string, string> });
    updateVisibility(values as Record<string, string>);

    // This is where you assign (set) the values that are added to formik form values in Form.tsx
    if (formValues.currentGroup !== currentGroup) {
      setFieldValue("currentGroup", currentGroup);
    }
    if (formValues.groupHistory !== groupHistory) {
      setFieldValue("groupHistory", groupHistory);
    }
    if (formValues.matchedIds !== matchedIds) {
      setFieldValue("matchedIds", matchedIds);
    }
  }, [
    updateValues,
    updateVisibility,
    values,
    setFieldValue,
    currentGroup,
    groupHistory,
    matchedIds,
    formValues,
  ]);
};
