"use client";
import { useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "./useGCFormContext";

type FormContextValues = {
  currentGroup: string | null;
  groupHistory: string[];
  matchedIds: string[];
};

const arraysMatch = (first: string[], second: string[]) =>
  first.length === second.length && first.every((value, index) => value === second[index]);

export const syncFormContextValues = (
  setFieldValue: (field: string, value: unknown) => void,
  previousValues: FormContextValues | undefined,
  nextValues: FormContextValues
): FormContextValues => {
  if (!previousValues || previousValues.currentGroup !== nextValues.currentGroup) {
    setFieldValue("currentGroup", nextValues.currentGroup);
  }
  if (!previousValues || !arraysMatch(previousValues.groupHistory, nextValues.groupHistory)) {
    setFieldValue("groupHistory", nextValues.groupHistory);
  }
  if (!previousValues || !arraysMatch(previousValues.matchedIds, nextValues.matchedIds)) {
    setFieldValue("matchedIds", nextValues.matchedIds);
  }

  return nextValues;
};

export const useFormValuesChanged = () => {
  const { values, setFieldValue } = useFormikContext();
  const { updateValues, currentGroup, getGroupHistory, matchedIds } = useGCFormsContext();
  const previousContextValues = useRef<FormContextValues | undefined>(undefined);

  useEffect(() => {
    if (process.env.APP_ENV === "test") {
      // skip for test env
      return;
    }
    updateValues({ formValues: values as Record<string, string> });

    previousContextValues.current = syncFormContextValues(
      setFieldValue,
      previousContextValues.current,
      {
        currentGroup,
        groupHistory: getGroupHistory(),
        matchedIds,
      }
    );
  }, [updateValues, values, setFieldValue, currentGroup, getGroupHistory, matchedIds]);
};
