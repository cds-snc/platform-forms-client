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

// TODO needs LOTS of unit tests (and related integration tests?)

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
  if (!Array.isArray(groupHistory) || !groups) return [];
  const history: Responses = {};
  // Iterates over each groupHistory Id and using the matched group Id, match the elements and their
  // values. This removes any "old" answers no longer relevant.
  groupHistory.forEach((key) => {
    groups[key].elements.forEach((element: string) => {
      const elementKey = element as keyof typeof Response;
      const elementName = element as keyof typeof formValues;
      history[elementKey] = formValues[elementName];
    });
  });
  return history;
};
