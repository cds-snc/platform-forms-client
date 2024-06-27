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

export const getRelevantValues = (
  allFormValues: Responses,
  allGroups: GroupsType | undefined,
  answeredGroups: string[]
) => {
  if (!Array.isArray(answeredGroups) || !allGroups) return [] as unknown as Responses;
  const relevantValues: Responses = {};
  answeredGroups.forEach((answeredGroupId) => {
    if (!allGroups[answeredGroupId] || !Array.isArray(allGroups[answeredGroupId].elements)) return;
    const groupValueIntersection = allGroups[answeredGroupId].elements;
    groupValueIntersection.forEach((relevantElement: string) => {
      const key = relevantElement as keyof typeof Response;
      const value = relevantElement as keyof typeof allFormValues;
      relevantValues[key] = allFormValues[value];
    });
  });
  return relevantValues;
};

export const filterNonRelevantValues = (allValues: Responses, valuesInHistory: Responses) => {
  if (!allValues || !valuesInHistory) return {} as Responses;
  const allValuesEmtpy = {} as Responses;
  for (const key in allValues) {
    allValuesEmtpy[key] = "";
  }
  return { ...allValuesEmtpy, ...valuesInHistory };
};

export const removeCustomFormValues = (values: Responses) => {
  const formValues = { ...values };
  delete formValues["currentGroup"];
  delete formValues["groupHistory"];
  return formValues;
};

export const getInputHistoryValues = (
  values: Responses,
  groupHistory: string[],
  groups: GroupsType | undefined
) => {
  const formValues = filterNonRelevantValues(
    values,
    getRelevantValues(values, groups, groupHistory as string[])
  );
  return removeCustomFormValues(formValues);
};
