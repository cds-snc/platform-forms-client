"use client";
// import { useEffect } from "react";
import { useState } from "react";
import { useFormikContext } from "formik";
import isEqual from "lodash.isequal";
import { useGCFormsContext } from "./useGCFormContext";
import { useEffectDebugger } from "@root/debugging/useEffect";
import { mapIdsToValues } from "@gcforms/core";
import { idArraysMatch } from "@lib/formContext";
import type { FormValues } from "@gcforms/types";

// Fields this hook writes back into formik values; excluded so writing them doesn't
// re-trigger the effect below on their own.
const META_KEYS = ["currentGroup", "groupHistory", "matchedIds"];

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

  const formValues = values as FormValues;
  const nextUserValues = Object.fromEntries(
    Object.entries(formValues).filter(([key]) => !META_KEYS.includes(key))
  );

  // Only replace the stored reference when the actual field values change, so writing
  // currentGroup/groupHistory/matchedIds back into formik doesn't change this dependency.
  const [userValues, setUserValues] = useState(nextUserValues);
  if (!isEqual(userValues, nextUserValues)) {
    setUserValues(nextUserValues);
  }

  useEffectDebugger(
    () => {
      if (process.env.APP_ENV === "test") {
        // skip for test env
        return;
      }
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
    [updateValues, userValues, setFieldValue, currentGroup, groupHistory, formRecord],
    ["updateValues", "userValues", "setFieldValue", "currentGroup", "groupHistory", "formRecord"]
  );
};
