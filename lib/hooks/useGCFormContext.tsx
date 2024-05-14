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
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import {
  addGroupHistory,
  getGroupHistory,
  removeGroupHistory,
} from "@lib/utils/form-builder/groupsHistory";

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
  groupsCheck: (groupsFlag: boolean | undefined) => boolean;
  getHistory: () => string[];
  addHistory: (groupId: string) => string[];
  removeHistory: (groupId: string) => string[];
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
  const initialGroup = groups ? LockedSections.START : null;
  const values = React.useRef({});
  const history = React.useRef<string[]>([LockedSections.START]);
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
        addHistory(nextAction);
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

  // TODO: once groups flag is on, just use formHasGroups
  const groupsCheck = (groupsFlag: boolean | undefined) => {
    // Check that the conditional logic flag is on and that this is a groups enabled form
    if (!groupsFlag || !currentGroup) return false;
    // Do an additional check to really make sure, there should be at least a start and end group
    return formHasGroups(formRecord.form);
  };

  const getHistory = () => getGroupHistory(history.current);

  const addHistory = (groupId: string) => addGroupHistory(groupId, history.current);

  // TODO: may want to also remove form values from groupId positing in history on
  const removeHistory = (groupId: string) => removeGroupHistory(groupId, history.current);

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
        groupsCheck,
        getHistory,
        addHistory,
        removeHistory,
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
      groupsCheck: () => false,
      getHistory: () => [],
      addHistory: () => [],
      removeHistory: () => [],
    };
  }
  return formsContext;
};
