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
  const initialGroup = groups ? (Object.keys(groups)[0] as string) : null;
  const values = React.useRef({});
  const [matchedIds, setMatchedIds] = React.useState<string[]>([]);
  const [currentGroup, setCurrentGroup] = React.useState<string | null>(initialGroup);

  const hasNextAction = (group: string) => {
    return groups[group]?.nextAction ? true : false;
  };

  const handleNextAction = () => {
    if (!currentGroup) return;

    // @todo add a test for this
    if (hasNextAction(currentGroup)) {
      let nextAction = groups[currentGroup].nextAction || "";

      // Check to see if next action is an array
      /*
       i.e. multiple next actions based on choice
       
      "nextAction": [
        { "choiceId": "1.0", "groupId": "f3e91cd0-343c-46a2-acab-3346865974cb" },
        { "choiceId": "1.1", "groupId": "93278f8e-5d47-4507-a104-c47e8a950da0" }
      ]
      */
      if (Array.isArray(nextAction)) {
        nextAction.forEach((action) => {
          const match = matchedIds.includes(action.choiceId);
          if (match) {
            nextAction = action.groupId;
          }
        });
      }

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

  return (
    <GCFormsContext.Provider
      value={{
        formRecord,
        updateValues,
        matchedIds,
        groups,
        currentGroup,
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
      matchedIds: [""],
      groups: {},
      currentGroup: "",
      hasNextAction: () => void 0,
      handleNextAction: () => void 0,
      formRecord: {} as PublicFormRecord,
    };
  }
  return formsContext;
};
