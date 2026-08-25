import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";

export const getGroupHistory = (history: string[]) => {
  if (!Array.isArray(history)) return [LOCKED_GROUPS.START];
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
