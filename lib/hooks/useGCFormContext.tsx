"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { PublicFormRecord } from "@lib/types";
import { mapIdsToValues, FormValues, idArraysMatch, GroupsType } from "@lib/formContext";

interface GCFormsContextValueType {
  updateValues: ({ formValues }: { formValues: FormValues }) => void;
  matchedIds: string[];
  groups?: GroupsType;
  currentGroup: string | null;
  handleNextAction: () => void;
  hasNextAction: (group: string) => boolean;
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
  const initialGroup = groups ? (Object.keys(groups)[0] as string) : null;
  const values = React.useRef({});
  const [matchedIds, setMatchedIds] = React.useState<string[]>([]);
  const [currentGroup, setCurrentGroup] = React.useState<string | null>(initialGroup);

  const hasNextAction = (group: string) => {
    return groups[group]?.nextAction ? true : false;
  };

  const handleNextAction = () => {
    if (!currentGroup) return;
    if (hasNextAction(currentGroup)) {
      setCurrentGroup(groups[currentGroup].nextAction as string);
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

  return (
    <GCFormsContext.Provider
      value={{ updateValues, matchedIds, groups, currentGroup, handleNextAction, hasNextAction }}
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
      matchedIds: [""],
      groups: {},
      currentGroup: "",
      hasNextAction: () => void 0,
      handleNextAction: () => void 0,
    };
  }
  return formsContext;
};
