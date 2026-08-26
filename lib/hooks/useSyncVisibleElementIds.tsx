"use client";
import { useEffect } from "react";
import { useFormikContext } from "formik";
import type { Responses } from "@gcforms/types";
import { useGCFormsContext } from "./useGCFormContext";

/**
 * This hook synchronizes the visible element IDs in GCForms context based
 * on the current form values from Formik. It listens for changes in the
 * form values and the currentGroup (page changes), and updates the
 * visible element IDs accordingly.
 */
export const useSyncVisibleElementIds = () => {
  const { values, setFieldValue } = useFormikContext<Responses>();
  const { updateVisibleElementIds, currentGroup } = useGCFormsContext();

  useEffect(() => {
    if (process.env.APP_ENV === "test") {
      // skip for test env
      return;
    }

    // Only sync currentGroup to formik if it has changed
    if (values.currentGroup !== currentGroup) {
      setFieldValue("currentGroup", currentGroup);
    }
    updateVisibleElementIds(values as Record<string, string>);
  }, [values, currentGroup]);
};
