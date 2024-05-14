import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";

export const getGroupHistory = (history: string[]) => {
  if (!Array.isArray(history)) return [LockedSections.START];
  return history;
};

export const addGroupHistory = (groupId: string, history: string[]) => {
  if (Array.isArray(history)) {
    history.push(groupId);
  }
  return getGroupHistory(history);
};

export const removeGroupHistory = (groupId: string, history: string[]) => {
  if (Array.isArray(history)) {
    // Re-start history from this groupId on
    const endIndex = history.findIndex((id) => id === groupId);
    if (endIndex > -1) {
      history.splice(endIndex + 1, history.length);
    }
  }
  return getGroupHistory(history);
};
