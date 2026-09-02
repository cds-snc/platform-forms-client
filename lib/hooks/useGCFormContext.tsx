"use client";
import { createContext, useContext, ReactNode, useState, useRef, useCallback } from "react";

import type { FormValues, GroupsType, PublicFormRecord } from "@gcforms/types";
import { type Language } from "@lib/types/form-builder-types";
import { getGroupTitle as groupTitle } from "@lib/utils/getGroupTitle";

import {
  getNextAction,
  filterValuesByVisibleElements,
  filterShownElements,
} from "@lib/formContext";

import {
  getValuesWithMatchedIds,
  getVisibleGroupsBasedOnValuesRecursive,
  mapIdsToValues,
} from "@gcforms/core";

import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import { copyObjectExcludingFileContent } from "@lib/fileExtractor";

interface GCFormsContextValueType {
  getValues: () => FormValues;
  groups?: GroupsType;
  currentGroup: string | null;
  getPreviousGroup: (currentGroup: string) => string;
  setGroup: (group: string | null) => void;
  handleNextAction: () => void;
  hasNextAction: (group: string) => boolean;
  isOffBoardSection: (group: string) => boolean;
  formId: string;
  formRecord: PublicFormRecord;
  submissionId: string | undefined;
  setSubmissionId: (submissionId: string) => void;
  submissionDate: string | undefined;
  setSubmissionDate: (date: string) => void;
  groupsCheck: (groupsFlag: boolean | undefined) => boolean;
  getGroupTitle: (groupId: string | null, language: Language) => string;
  getProgressData: () => {
    id: string;
    values: FormValues;
    currentGroup: string;
    versionNumber?: number | null;
  };
  visibleElementIds: Set<string> | null;
  updateVisibleElementIds: (formValues: Record<string, string>) => void;
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
  const [currentGroup, setCurrentGroup] = useState<string | null>(initialGroup);
  const [submissionId, setSubmissionId] = useState<string | undefined>(undefined);
  const [submissionDate, setSubmissionDate] = useState<string | undefined>(undefined);
  const [visibleElementIds, setVisibleElementIds] = useState<Set<string> | null>(null);

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

    const filteredResponses = filterValuesByVisibleElements(formRecord, values.current);
    const matchedIds = mapIdsToValues(formRecord.form.elements, values.current);
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
      }
    }
  };

  const getValues = () => {
    return values.current;
  };

  const updateVisibleElementIds = useCallback(
    (formValues: Record<string, string>) => {
      const visibleElements = filterShownElements(
        formRecord,
        formValues as FormValues,
        currentGroup ?? "start"
      );
      const newVisibleElementIds = new Set(visibleElements.map((element) => element.id.toString()));

      // Only update the state if the new set of visible element IDs is different from the
      // previous set (ie reduce rerenders for changes that don't affect visibility)
      setVisibleElementIds((previousVisibleElementIds) => {
        const hasChanged =
          previousVisibleElementIds === null ||
          previousVisibleElementIds.size !== newVisibleElementIds.size ||
          [...newVisibleElementIds].some((id) => !previousVisibleElementIds.has(id));

        return hasChanged ? newVisibleElementIds : previousVisibleElementIds;
      });

      values.current = formValues as FormValues;
    },
    [formRecord, currentGroup]
  );

  // Helper to not expose the setter
  const setGroup = (group: string | null) => {
    setCurrentGroup(group);
  };

  // TODO: once groups flag is on, just use formHasGroups
  const groupsCheck = (groupsFlag: boolean | undefined) => {
    // Check that the conditional logic flag is on and that this is a groups enabled form
    if (!groupsFlag || !currentGroup) return false;
    // Do an additional check to really make sure, there should be at least a start and end group
    return formHasGroups(formRecord.form);
  };

  const getProgressData = () => {
    const { formValuesWithoutFileContent } = copyObjectExcludingFileContent(
      values.current,
      {},
      true
    );

    return {
      id: formRecord.id,
      values: formValuesWithoutFileContent as FormValues,
      currentGroup: currentGroup || "",
      versionNumber: formRecord.versionNumber ?? 1,
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
        formId: formRecord.id,
        submissionId,
        setSubmissionId,
        submissionDate,
        setSubmissionDate,
        getValues,
        groups,
        currentGroup,
        getPreviousGroup,
        setGroup,
        handleNextAction,
        hasNextAction,
        isOffBoardSection,
        groupsCheck,
        getGroupTitle,
        getProgressData,
        visibleElementIds,
        updateVisibleElementIds,
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
      getValues: () => {
        return {};
      },
      submissionId: undefined,
      setSubmissionId: () => void 0,
      submissionDate: undefined,
      setSubmissionDate: () => void 0,
      groups: {},
      currentGroup: "",
      getPreviousGroup: () => "",
      setGroup: () => void 0,
      hasNextAction: () => void 0,
      isOffBoardSection: () => false,
      handleNextAction: () => void 0,
      formRecord: {} as PublicFormRecord,
      formId: "0000",
      groupsCheck: () => false,
      getGroupTitle: () => "",
      visibleElementIds: new Set<string>(),
      updateVisibleElementIds: () => void 0,
      getProgressData: () => {
        return {
          id: "",
          values: {},
          currentGroup: "",
          versionNumber: 1,
        };
      },
    };
  }
  return formsContext;
};
