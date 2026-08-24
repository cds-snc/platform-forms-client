"use client";
// import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";
import { useEffectDebugger } from "@root/debugger/useEffect";

/**
 * This hook synchronizes the visible element IDs in GCForms context based
 * on the current form values from Formik. It listens for changes in the
 * form values and the currentGroup (page changes), and updates the
 * visible element IDs accordingly.
 */
export const useSyncVisibleElementIds = () => {
  const { values } = useFormikContext();
  const { updateVisibleElementIds, currentGroup } = useGCFormsContext();

  useEffectDebugger(
    () => {
      if (process.env.APP_ENV === "test") {
        // skip for test env
        return;
      }

      updateVisibleElementIds(values as Record<string, string>);
    },
    [values, currentGroup],
    ["values", "currentGroup"]
  );
};
