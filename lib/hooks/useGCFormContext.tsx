"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";

import type { FormValues, GroupsType, PublicFormRecord } from "@gcforms/types";
import { type Language } from "@lib/types/form-builder-types";
import { getGroupTitle as groupTitle } from "@lib/utils/getGroupTitle";
import { useCustomEvent, EventKeys } from "@lib/hooks/useCustomEvent";

import { getNextAction, filterValuesByVisibleElements, idArraysMatch } from "@lib/formContext";

import {
  mapIdsToValues,
  getValuesWithMatchedIds,
  getVisibleGroupsBasedOnValuesRecursive,
  buildElementDependencies,
  buildElementMap,
  computeAllVisibility,
  recomputeAffectedVisibility,
  getChangedChoiceElementIds,
} from "@gcforms/core";

import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import {
  getGroupHistory as _getGroupHistory,
  pushIdToHistory as _pushIdToHistory,
  clearHistoryAfterId as _clearHistoryAfterId,
} from "@lib/utils/form-builder/groupsHistory";

import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";

import { copyObjectExcludingFileContent } from "@lib/fileExtractor";

interface GCFormsContextValueType {
  updateValues: ({ formValues }: { formValues: FormValues }) => void;
  getValues: () => FormValues;
  matchedIds: React.RefObject<string[]>;
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
  getGroupHistory: () => string[];
  pushIdToHistory: (groupId: string) => string[];
  clearHistoryAfterId: (groupId: string) => string[];
  getGroupTitle: (groupId: string | null, language: Language) => string;
  getProgressData: () => {
    id: string;
    values: FormValues;
    history: string[];
    currentGroup: string;
    versionNumber?: number | null;
  };
}

const GCFormsContext = createContext<GCFormsContextValueType | undefined>(undefined);

interface VisibilityContextValueType {
  isElementVisible: (elementId: string) => boolean;
}

const VisibilityContext = createContext<VisibilityContextValueType | undefined>(undefined);

export const GCFormsProvider = ({
  children,
  formRecord,
}: {
  children: ReactNode;
  formRecord: PublicFormRecord;
}) => {
  const { Event } = useCustomEvent();
  const groups: GroupsType = formRecord.form.groups || {};
  const initialGroup = groups ? LOCKED_GROUPS.START : null;
  const values = useRef({});
  const history = useRef<string[]>([LOCKED_GROUPS.START]);
  const matchedIds = useRef<string[]>([]);
  const [currentGroup, setCurrentGroup] = useState<string | null>(initialGroup);
  const [submissionId, setSubmissionId] = useState<string | undefined>(undefined);
  const [submissionDate, setSubmissionDate] = useState<string | undefined>(undefined);

  // Initialize visibility state with element dependencies
  const elementDependencies = useMemo(
    () => buildElementDependencies(formRecord.form.elements),
    [formRecord.form.elements]
  );

  // Build the element lookup map once — elements don't change during a session.
  // Passed to recomputeAffectedVisibility to avoid rebuilding it on every value change.
  const elementMap = useMemo(
    () => buildElementMap(formRecord.form.elements),
    [formRecord.form.elements]
  );

  const [visibilityMap, setVisibilityMap] = useState<Map<string, boolean>>(() =>
    computeAllVisibility(formRecord, {})
  );
  // Ref stays in sync with state so updateValues always reads the latest map
  // synchronously, even if multiple updates arrive before the next re-render.
  const visibilityMapRef = useRef(visibilityMap);

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
    const filteredMatchedIds = matchedIds.current.filter((id) => {
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

  const updateValues = ({ formValues }: { formValues: FormValues }): void => {
    const oldValues = values.current;
    values.current = formValues;
    const valueIds = mapIdsToValues(formRecord.form.elements, formValues);
    if (!idArraysMatch(matchedIds.current, valueIds)) {
      matchedIds.current = valueIds;
    }

    const changedChoiceIds = getChangedChoiceElementIds(
      oldValues,
      formValues,
      formRecord.form.elements,
      elementDependencies,
      elementMap
    );

    if (changedChoiceIds.length > 0) {
      // Read the latest map from the ref (not stale closure state) and recompute
      const prevVisibilityMap = visibilityMapRef.current;
      const updatedVisibility = recomputeAffectedVisibility(
        formRecord,
        formValues,
        changedChoiceIds,
        elementDependencies,
        prevVisibilityMap,
        elementMap
      );

      // Keep the ref in sync so rapid successive calls use the latest base map
      visibilityMapRef.current = updatedVisibility;
      // Pure state update - no side effects inside the setter
      setVisibilityMap(updatedVisibility);

      // Build the diff outside the setter so it's available to the event payload
      const visibilityChanges: Record<string, boolean> = {};
      updatedVisibility.forEach((isVisible, id) => {
        if (prevVisibilityMap.get(id) !== isVisible) {
          visibilityChanges[id] = isVisible;
        }
      });

      // Deferring to next tick because CustomEvent dispatch is synchronous and
      // firing inline triggers a React "setState during render" warning
      queueMicrotask(() => {
        Event.fire(EventKeys.formValuesChanged, {
          changedChoiceIds,
          visibilityChanges,
          values: formValues,
        });
      });
    }
  };

  // Helper to not expose the setter
  const setGroup = (group: string | null) => {
    setCurrentGroup(group);
  };

  const getValues = () => {
    return values.current;
  };

  const isElementVisible = useCallback(
    (elementId: string): boolean => {
      return visibilityMap.get(elementId) ?? true;
    },
    [visibilityMap]
  );

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
      <VisibilityContext.Provider value={{ isElementVisible }}>
        {children}
      </VisibilityContext.Provider>
    </GCFormsContext.Provider>
  );
};

export const useGCFormsContext = () => {
  const formsContext = useContext(GCFormsContext);
  const defaultMatchedIdRef = useRef<string[]>([]);
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
      matchedIds: defaultMatchedIdRef,
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
          versionNumber: 1,
        };
      },
    };
  }
  return formsContext;
};

export const useVisibilityContext = () => {
  const ctx = useContext(VisibilityContext);
  // Outside the provider treat every element as visible
  if (ctx === undefined) {
    return { isElementVisible: () => true };
  }
  return ctx;
};
