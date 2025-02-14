"use client";
import React, { createContext, useContext, ReactNode } from "react";

import { type Language } from "@lib/types/form-builder-types";
import { type PublicFormRecord } from "@lib/types";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { getGroupTitle as groupTitle } from "@lib/utils/getGroupTitle";

import {
  mapIdsToValues,
  FormValues,
  idArraysMatch,
  GroupsType,
  getNextAction,
  filterShownElements,
  filterValuesByShownElements,
} from "@lib/formContext";
import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import {
  getGroupHistory as _getGroupHistory,
  pushIdToHistory as _pushIdToHistory,
  clearHistoryAfterId as _clearHistoryAfterId,
  getPreviousIdFromCurrentId,
  getInputHistoryValues,
} from "@lib/utils/form-builder/groupsHistory";

import {
  saveSessionProgress as saveToSession,
  restoreSessionProgress as restoreSession,
} from "@lib/utils/saveSessionProgress";

import { toggleSavedValues } from "@i18n/toggleSavedValues";

interface GCFormsContextValueType {
  updateValues: ({ formValues }: { formValues: FormValues }) => void;
  getValues: () => FormValues;
  matchedIds: string[];
  filteredMatchedIds: string[];
  groups?: GroupsType;
  currentGroup: string | null;
  previousGroup: string | null;
  setGroup: (group: string | null) => void;
  handleNextAction: () => void;
  handlePreviousAction: () => void;
  hasNextAction: (group: string) => boolean;
  isOffBoardSection: (group: string) => boolean;
  formRecord: PublicFormRecord;
  submissionId: string | undefined;
  setSubmissionId: (submissionId: string) => void;
  groupsCheck: (groupsFlag: boolean | undefined) => boolean;
  getGroupHistory: () => string[];
  pushIdToHistory: (groupId: string) => string[];
  clearHistoryAfterId: (groupId: string) => string[];
  getGroupTitle: (groupId: string | null, language: Language) => string;
  saveSessionProgress: (language: Language | undefined) => void;
  restoreSessionProgress: (language: Language) => FormValues | false;
  getProgressData: () => {
    id: string;
    values: FormValues;
    history: string[];
    currentGroup: string;
  };
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
  const [submissionId, setSubmissionId] = React.useState<string | undefined>(undefined);

  const inputHistoryValues = getInputHistoryValues(
    (values.current || []) as FormValues,
    (history.current || []) as string[],
    groups
  );
  const shownElements = filterShownElements(formRecord.form.elements, matchedIds as string[]);
  const filteredResponses = filterValuesByShownElements(inputHistoryValues, shownElements);
  const filteredMatchedIds = matchedIds.filter((id) => {
    const parentId = id.split(".")[0];
    if (filteredResponses[parentId]) {
      return id;
    }
  });

  const hasNextAction = (group: string) => {
    return groups[group]?.nextAction ? true : false;
  };

  /**
   * Handle check if the group is an off-board section
   * In which case we don't want to navigate to the next group or submit
   * @param group
   * @returns boolean
   */
  const isOffBoardSection = (group: string) => {
    const next = groups[group]?.nextAction;
    if (next === "exit") {
      return true;
    }

    return false;
  };

  const handleNextAction = () => {
    if (!currentGroup) return;

    if (hasNextAction(currentGroup)) {
      const nextAction = getNextAction(groups, currentGroup, filteredMatchedIds);

      // Helpful for navigating to the last group
      setPreviousGroup(currentGroup);

      if (typeof nextAction === "string") {
        setCurrentGroup(nextAction);
        pushIdToHistory(nextAction);
      }
    }
  };

  const handlePreviousAction = () => {
    if (!currentGroup) return;
    const previousGroupId = getPreviousIdFromCurrentId(currentGroup, history.current);
    if (previousGroupId) {
      setGroup(previousGroupId);
      clearHistoryAfterId(previousGroupId);
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

  const getGroupHistory = () => _getGroupHistory(history.current);

  const pushIdToHistory = (groupId: string) => _pushIdToHistory(groupId, history.current);

  // Note: this only removes the group entry and not the values
  const clearHistoryAfterId = (groupId: string) => _clearHistoryAfterId(groupId, history.current);

  const getProgressData = () => {
    return {
      id: formRecord.id,
      values: values.current,
      history: history.current,
      currentGroup: currentGroup || "",
    };
  };

  const saveSessionProgress = (language: Language = "en") => {
    const vals =
      language === "en"
        ? values.current
        : (toggleSavedValues(formRecord.form, { values: values.current }, "en") as FormValues);

    saveToSession(language, {
      id: formRecord.id,
      values: vals,
      history: history.current,
      currentGroup: currentGroup || "",
    });
  };

  const restoreSessionProgress = (language: Language) => {
    return restoreSession({ id: formRecord.id, form: formRecord.form, language });
  };

  const getGroupTitle = (groupId: string | null, language: Language) => {
    return groupTitle({ groups, groupId, language });
  };

  return (
    <GCFormsContext.Provider
      value={{
        formRecord,
        submissionId,
        setSubmissionId,
        updateValues,
        getValues,
        matchedIds,
        filteredMatchedIds,
        groups,
        currentGroup,
        previousGroup,
        setGroup,
        handleNextAction,
        handlePreviousAction,
        hasNextAction,
        isOffBoardSection,
        groupsCheck,
        getGroupHistory,
        pushIdToHistory,
        clearHistoryAfterId,
        getGroupTitle,
        saveSessionProgress,
        getProgressData,
        restoreSessionProgress,
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
      submissionId: undefined,
      setSubmissionId: () => void 0,
      matchedIds: [""],
      filteredMatchedIds: [""],
      groups: {},
      currentGroup: "",
      previousGroup: "",
      setGroup: () => void 0,
      hasNextAction: () => void 0,
      isOffBoardSection: () => false,
      handleNextAction: () => void 0,
      handlePreviousAction: () => void 0,
      formRecord: {} as PublicFormRecord,
      groupsCheck: () => false,
      getGroupHistory: () => [],
      pushIdToHistory: () => [],
      clearHistoryAfterId: () => [],
      getGroupTitle: () => "",
      saveSessionProgress: () => void 0,
      getProgressData: () => {
        return {
          id: "",
          values: {},
          history: [],
          currentGroup: "",
        };
      },
      restoreSessionProgress: () => {
        return {};
      },
    };
  }
  return formsContext;
};
