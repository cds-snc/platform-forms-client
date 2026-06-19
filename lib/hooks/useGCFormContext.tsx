"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import type { Responses, GroupsType, PublicFormRecord } from "@gcforms/types";
import { type Language } from "@lib/types/form-builder-types";
import { getGroupTitle as groupTitle } from "@lib/utils/getGroupTitle";

import { getNextAction, filterValuesByVisibleElements, idArraysMatch } from "@lib/formContext";

import {
  mapIdsToValues,
  getValuesWithMatchedIds,
  getVisibleGroupsBasedOnValuesRecursive,
} from "@gcforms/core";

import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import {
  getGroupHistory as _getGroupHistory,
  pushIdToHistory as _pushIdToHistory,
  clearHistoryAfterId as _clearHistoryAfterId,
} from "@lib/utils/form-builder/groupsHistory";

import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import { useAppUpdate } from "@lib/hooks/useAppUpdate";
import { useTranslation } from "@i18n/client";
import { logMessage } from "../logger";
import { FormValues } from "@root/packages/types/dist";
import { copyObjectExcludingFileContent, saveSessionProgress } from "@lib/hooks/useResponseCache";
interface GCFormsContextValueType {
  updateValues: ({ formValues }: { formValues: Responses }) => void;
  getValues: () => Responses;
  matchedIds: string[];
  groups?: GroupsType;
  currentGroup: string | null;
  getPreviousGroup: (currentGroup: string) => string;
  setGroup: (group: string | null) => void;
  handleNextAction: () => void;
  hasNextAction: (group: string) => boolean;
  isOffBoardSection: (group: string) => boolean;
  formRecord: PublicFormRecord;
  submissionId: string | undefined;
  setSubmissionId: (submissionId: string) => void;
  submissionDate: string | undefined;
  setSubmissionDate: (date: string) => void;
  groupsCheck: (groupsFlag: boolean | undefined) => boolean;
  getGroupHistory: () => string[];
  pushIdToHistory: (groupId: string) => string[];
  clearHistoryAfterId: (groupId: string) => string[];
  getGroupTitle: (groupId: string | null, language: Language) => string;
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
  const initialGroup = groups ? LOCKED_GROUPS.START : null;
  const values = useRef({});
  const history = useRef<string[]>([LOCKED_GROUPS.START]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [currentGroup, setCurrentGroup] = useState<string | null>(initialGroup);
  const [submissionId, setSubmissionId] = useState<string | undefined>(undefined);
  const [submissionDate, setSubmissionDate] = useState<string | undefined>(undefined);
  const { updateRequired } = useAppUpdate();
  const {
    i18n: { language },
  } = useTranslation();
  const hasNextAction = (group: string) => {
    return groups[group]?.nextAction ? true : false;
  };
  const saveToCache = useCallback(async () => {
    // Do not save to cache when on the resume page as it will overwrite the loaded
    // values from the file.  This is because the GCFormsContext also wraps the
    // resume page

    logMessage.debug({ formId: formRecord.id, currentGroup, language });
    if (window.location.href !== `/${language}/id/${formRecord.id}/resume`) {
      await saveSessionProgress({
        id: formRecord.id,
        values: values.current,
        history: history.current,
        currentGroup: currentGroup || "",
        language: language,
      });
    }
  }, [formRecord.id, currentGroup, language]);

  useEffect(() => {
    const updateCheck = async () => {
      logMessage.debug(`Update is ${updateRequired ? "required" : "not required"}`);
      if (updateRequired) {
        logMessage.debug("Saving response state because update is required");
        await saveToCache();
      }
    };
    updateCheck();
  }, [updateRequired, saveToCache]);

  useEffect(() => {
    const visibilityChanged = async () => {
      logMessage.debug(
        `Window visibility changed: ${document.visibilityState ? "hidden" : "visible"}`
      );
      await saveToCache();
    };

    document.addEventListener("visibilitychange", visibilityChanged);

    return () => {
      logMessage.debug("Removing event listener for beforeUnloadHandler");

      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [saveToCache]);

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

    const filteredResponses = filterValuesByVisibleElements(
      formRecord,
      values.current as FormValues
    );
    const filteredMatchedIds = matchedIds.filter((id) => {
      const parentId = id.split(".")[0];
      if (filteredResponses[parentId]) {
        return id;
      }
    });

    if (hasNextAction(currentGroup)) {
      const nextAction = getNextAction(groups, currentGroup, filteredMatchedIds);

      if (typeof nextAction === "string") {
        setCurrentGroup(nextAction);
        pushIdToHistory(nextAction);
      }
    }
  };

  const updateValues = ({ formValues }: { formValues: Responses }): void => {
    values.current = formValues;
    const valueIds = mapIdsToValues(formRecord.form.elements, formValues as FormValues);
    if (!idArraysMatch(matchedIds, valueIds)) {
      setMatchedIds(valueIds);
    }
  };

  // Helper to not expose the setter
  const setGroup = (group: string | null) => {
    setCurrentGroup(group);
  };

  const getValues = () => {
    return values.current;
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
    const { formValuesWithoutFileContent } = copyObjectExcludingFileContent(values.current);

    return {
      id: formRecord.id,
      values: formValuesWithoutFileContent as FormValues,
      history: history.current,
      currentGroup: currentGroup || "",
    };
  };

  const getGroupTitle = (groupId: string | null, language: Language) => {
    return groupTitle({ groups, groupId, language });
  };

  const getPreviousGroup = (currentGroup: string) => {
    const valuesWithMatchedIds = getValuesWithMatchedIds(
      formRecord.form.elements,
      values.current as FormValues
    );
    const visibleGroups = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      valuesWithMatchedIds,
      "start"
    );

    const idx = visibleGroups.indexOf(currentGroup);
    if (idx === -1 || idx === 0) {
      return currentGroup;
    }
    return visibleGroups[idx - 1];
  };

  return (
    <GCFormsContext.Provider
      value={{
        formRecord,
        submissionId,
        setSubmissionId,
        submissionDate,
        setSubmissionDate,
        updateValues,
        getValues,
        matchedIds,
        groups,
        currentGroup,
        getPreviousGroup,
        setGroup,
        handleNextAction,
        hasNextAction,
        isOffBoardSection,
        groupsCheck,
        getGroupHistory,
        pushIdToHistory,
        clearHistoryAfterId,
        getGroupTitle,
        getProgressData,
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
        return {};
      },
      submissionId: undefined,
      setSubmissionId: () => void 0,
      submissionDate: undefined,
      setSubmissionDate: () => void 0,
      matchedIds: [""],
      groups: {},
      currentGroup: "",
      getPreviousGroup: () => "",
      setGroup: () => void 0,
      hasNextAction: () => void 0,
      isOffBoardSection: () => false,
      handleNextAction: () => void 0,
      formRecord: {} as PublicFormRecord,
      groupsCheck: () => false,
      getGroupHistory: () => [],
      pushIdToHistory: () => [],
      clearHistoryAfterId: () => [],
      getGroupTitle: () => "",
      getProgressData: () => {
        return {
          id: "",
          values: {},
          history: [],
          currentGroup: "",
        };
      },
    };
  }
  return formsContext;
};
