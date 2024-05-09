"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { PublicFormRecord } from "@lib/types";
import {
  mapIdsToValues,
  FormValues,
  idArraysMatch,
  GroupsType,
  getNextAction,
} from "@lib/formContext";

interface GCFormsContextValueType {
  updateValues: ({ formValues }: { formValues: FormValues }) => void;
  getValues: () => FormValues;
  matchedIds: string[];
  groups?: GroupsType;
  currentGroup: string | null;
  previousGroup: string | null;
  setGroup: (group: string | null) => void;
  handleNextAction: () => void;
  hasNextAction: (group: string) => boolean;
  formRecord: PublicFormRecord;
}

const GCFormsContext = createContext<GCFormsContextValueType | undefined>(undefined);

export const GCFormsProvider = ({
  children,
  formRecord,
}: {
  children: ReactNode;
  formRecord: PublicFormRecord;
}) => {
  const groups: GroupsType = formRecord.form.groups || {};
  // TODO: use an enum for "start"
  const initialGroup = groups ? "start" : null;
  const values = React.useRef({});
  const [matchedIds, setMatchedIds] = React.useState<string[]>([]);
  const [currentGroup, setCurrentGroup] = React.useState<string | null>(initialGroup);
  const [previousGroup, setPreviousGroup] = React.useState<string | null>(initialGroup);

  const hasNextAction = (group: string) => {
    return groups[group]?.nextAction ? true : false;
  };

  const handleNextAction = () => {
    if (!currentGroup) return;

    if (hasNextAction(currentGroup)) {
      const nextAction = getNextAction(groups, currentGroup, matchedIds);

      // Helpful for navigating to the last group
      setPreviousGroup(currentGroup);

      if (typeof nextAction === "string") {
        setCurrentGroup(nextAction);
      }
    }
  };

  const updateValues = ({
    formValues,
  }: {
    formValues: Record<string, string[] | string>;
  }): void => {
    values.current = formValues;
    const valueIds = mapIdsToValues(formRecord, formValues);
    if (!idArraysMatch(matchedIds, valueIds)) {
      setMatchedIds(valueIds);
    }
  };

  // Helper to not expose the setter
  const setGroup = (group: string | null) => {
    setCurrentGroup(group);
  };

  const getValues = () => {
    return values.current as FormValues;
  };

  return (
    <GCFormsContext.Provider
      value={{
        formRecord,
        updateValues,
        getValues,
        matchedIds,
        groups,
        currentGroup,
        previousGroup,
        setGroup,
        handleNextAction,
        hasNextAction,
      }}
    >
      {children}
    </GCFormsContext.Provider>
  );
};

export const useGCFormsContext = () => {
  const formsContext = useContext(GCFormsContext);
  if (formsContext === undefined) {
    // For now just return a default context if we're not inside the provider
    return {
      updateValues: () => {
        return "noop";
      },
      getValues: () => {
        return;
      },
      matchedIds: [""],
      groups: {},
      currentGroup: "",
      previousGroup: "",
      setGroup: () => void 0,
      hasNextAction: () => void 0,
      handleNextAction: () => void 0,
      formRecord: {} as PublicFormRecord,
    };
  }
  return formsContext;
};
