import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { GroupsType } from "@lib/formContext";
import { Responses } from "@lib/types";

export const getGroupHistory = (history: string[]) => {
  if (!Array.isArray(history)) return [LockedSections.START];
  return history;
};

export const pushIdToHistory = (groupId: string, history: string[]) => {
  if (Array.isArray(history)) {
    history.push(groupId);
  }
  return getGroupHistory(history);
};

export const clearHistoryAfterId = (groupId: string, history: string[]) => {
  if (Array.isArray(history)) {
    const endHistoryIndex = history.findIndex((id) => id === groupId);
    if (endHistoryIndex > -1) {
      history.splice(endHistoryIndex + 1, history.length);
    }
  }
  return getGroupHistory(history);
};

export const getPreviousIdFromCurrentId = (currentId: string, history: string[]) => {
  if (Array.isArray(history)) {
    const currentIndex = history.findIndex((id) => id === currentId);
    if (currentIndex > 0) {
      return history[currentIndex - 1];
    }
  }
  return null;
};

/**
 * Removes any values that are not on the branching path a user followed.
 *
 * e.g. If a user went down a conditional path B filled in some vaules but then went back and
 * chose conditional path A. The previous no longer relevant values from path B would be removed.
 * @param allFormValues
 * @param allGroups
 * @param answeredGroups
 * @returns
 */
export const filterValuesByVisitedGroup = (
  allFormValues: Responses,
  allGroups: GroupsType | undefined,
  answeredGroups: string[]
) => {
  if (!Array.isArray(answeredGroups) || !allGroups) return [] as unknown as Responses;
  const relevantValues: Responses = {};
  answeredGroups.forEach((answeredGroupId) => {
    if (!allGroups[answeredGroupId] || !Array.isArray(allGroups[answeredGroupId].elements)) return;
    // Filters in any values that are on the path the user took
    const groupValueIntersection = allGroups[answeredGroupId].elements;
    groupValueIntersection.forEach((relevantElement: string) => {
      const key = relevantElement as keyof typeof Response;
      const value = relevantElement as keyof typeof allFormValues;
      relevantValues[key] = allFormValues[value];
    });
  });
  return relevantValues;
};

export const removeFormContext = (allValues: Responses, valuesInHistory: Responses) => {
  if (!allValues || !valuesInHistory) return {} as Responses;
  const allValuesEmtpy = {} as Responses;
  for (const key in allValues) {
    allValuesEmtpy[key] = "";
  }
  return { ...allValuesEmtpy, ...valuesInHistory };
};

export const removeFormContextValues = (values: Responses) => {
  const formValues = { ...values };
  delete formValues["currentGroup"];
  delete formValues["groupHistory"];
  delete formValues["matchedIds"];
  return formValues;
};

export const getInputHistoryValues = (
  values: Responses,
  groupHistory: string[],
  groups: GroupsType | undefined
) => {
  const formValues = removeFormContext(
    values,
    filterValuesByVisitedGroup(values, groups, groupHistory as string[])
  );
  return formValues;
};
