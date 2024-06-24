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
    // Re-start history from this groupId on
    const endIndex = history.findIndex((id) => id === groupId);
    if (endIndex > -1) {
      history.splice(endIndex + 1, history.length);
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
 * Removes user answers that are no longer relevant based on the group history.
 * A user could navigate a form down one conditional logic path, get to the review page, and then
 * navigate back to the a previous group and change their answers. Then the old answers from the
 * previous navigation would still be there and the output would include both the old and the new
 * answers. To keep only the relavant answers, the function removes the old answers.
 */
export const getGroupValues = (
  formValues: Responses,
  groups: GroupsType | undefined,
  groupHistory: string[]
) => {
  if (!Array.isArray(groupHistory) || !groups) return [] as unknown as Responses;
  const history: Responses = {};
  // Iterates over each groupHistory Id and using the matched group Id, match the elements and their
  // values. This removes any "old" answers no longer relevant.
  groupHistory.forEach((key) => {
    if (!groups[key] || !Array.isArray(groups[key].elements)) return;
    groups[key].elements.forEach((element: string) => {
      const elementKey = element as keyof typeof Response;
      const elementName = element as keyof typeof formValues;
      history[elementKey] = formValues[elementName];
    });
  });
  return history;
};

// TODO rename to something like combineAnswers
/**
 * Combines all questions with answered questions but only the answered questions values are kept.
 */
export const valuesOnlyInHistory = (inputValues: Responses, groupValues: Responses) => {
  if (!inputValues || !groupValues) return {} as Responses;
  // clear all old and new answers
  const emptyInputValues = {} as Responses;
  for (const key in inputValues) {
    emptyInputValues[key] = "";
  }
  // overwrite the complete empty list of answers with the relevant answers
  return { ...emptyInputValues, ...groupValues };
};

/**
 * Another way to do this would be to compare the formResponse against the values, and only keep
 * the values that are in the formResponse. See buildFormDataObject()
 */
export const removeNonFormValues = (values: Responses) => {
  const formValues = { ...values };
  // Remove any custom properties here
  delete formValues["currentGroup"];
  delete formValues["groupHistory"];
  return formValues;
};
