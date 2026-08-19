"use client";
// import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";
import { useEffectDebugger } from "@root/debugging/useEffect";
import { mapIdsToValues } from "@gcforms/core";
import { idArraysMatch } from "@lib/formContext";
import type { FormValues } from "@gcforms/types";

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
  const { updateValues, currentGroup, getGroupHistory, formRecord } = useGCFormsContext();
  const groupHistory = getGroupHistory();

  useEffectDebugger(
    () => {
      if (process.env.APP_ENV === "test") {
        // skip for test env
        return;
      }
      const formValues = values as FormValues;
      updateValues({ formValues });

      // This is where you assign (set) the values that are added to formik form values in Form.tsx
      setFieldValue("currentGroup", currentGroup);
      setFieldValue("groupHistory", groupHistory);

      // Compute matchedIds directly from values instead of reading it back from GCFormsContext
      // state, otherwise writing it into formik values re-triggers this effect an extra time.
      const nextMatchedIds = mapIdsToValues(formRecord.form.elements, formValues);
      const currentMatchedIds = (formValues.matchedIds as string[]) || [];
      if (!idArraysMatch(currentMatchedIds, nextMatchedIds)) {
        setFieldValue("matchedIds", nextMatchedIds);
      }
    },
    [updateValues, values, setFieldValue, currentGroup, groupHistory, formRecord],
    ["updateValues", "values", "setFieldValue", "currentGroup", "getGroupHistory", "formRecord"]
  );
};
