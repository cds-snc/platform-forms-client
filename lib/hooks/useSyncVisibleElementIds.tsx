"use client";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";
import { useEffectDebugger } from "@root/debugger/useEffect";
import { getElementIdsAffectingVisibility } from "@lib/formContext";
import { useMemo } from "react";

/**
 * This hook synchronizes the visible element IDs in the form context with the current form values.
 * It listens for changes in the form values that affect visibility and updates the context accordingly.
 *
 * @returns {void}
 */
export const useSyncVisibleElementIds = () => {
  const { values, setFieldValue } = useFormikContext();
  const { updateVisibleElementIds, currentGroup, formRecord } = useGCFormsContext();

  // Get the element ids that affect visibility from the form record
  const visibilityElementIds = useMemo(
    () => getElementIdsAffectingVisibility(formRecord),
    [formRecord]
  );

  // Create a key that changes whenever the values of the visibility affecting elements change
  const visibilityValuesKey = JSON.stringify(
    visibilityElementIds.map((id) => (values as Record<string, string>)[id])
  );

  useEffectDebugger(
    () => {
      if (process.env.APP_ENV === "test") {
        // skip for test env
        return;
      }

      setFieldValue("currentGroup", currentGroup);
      updateVisibleElementIds(values as Record<string, string>);
    },
    [visibilityValuesKey, currentGroup],
    ["visibilityValuesKey", "currentGroup"]
  );
};
