"use client";
// import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";
import { useEffectDebugger } from "@root/debugger/useEffect";

export const useSyncVisibleElementIds = () => {
  const { values, setFieldValue } = useFormikContext();
  const { updateVisibleElementIds, currentGroup } = useGCFormsContext();

  useEffectDebugger(
    () => {
      if (process.env.APP_ENV === "test") {
        // skip for test env
        return;
      }

      setFieldValue("currentGroup", currentGroup);
      updateVisibleElementIds(values as Record<string, string>);
    },
    [values, currentGroup],
    ["values", "currentGroup"]
  );
};
