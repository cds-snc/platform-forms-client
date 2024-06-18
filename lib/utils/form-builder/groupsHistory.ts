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
export const getGroupValues = (
  formValues: Responses,
  groups: GroupsType | undefined,
  groupHistory: string[]
) => {
  if (!Array.isArray(groupHistory) || !groups) return [];
  const history = {};
  // Iterate over each groupHistory Id and using the matched group Id, match the elements and their
  // values
  groupHistory.forEach((key) => {
    groups[key].elements.forEach((element: string) => {
      const elementName = element as keyof typeof formValues;
      history[element] = formValues[elementName];
    });
  });
  return history;
};
