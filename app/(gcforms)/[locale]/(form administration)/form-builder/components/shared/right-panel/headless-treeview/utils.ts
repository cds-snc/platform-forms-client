/**
 * Utility functions for TreeView integration with external store
 */

import { TreeItemIndex } from "react-complex-tree";

/**
 * Converts element IDs to tree item IDs
 */
export const elementIdToTreeId = (elementId: number): TreeItemIndex => {
  return String(elementId);
};

/**
 * Converts tree item IDs back to element IDs
 */
export const treeIdToElementId = (treeId: TreeItemIndex): number | null => {
  const id = parseInt(String(treeId));
  return isNaN(id) ? null : id;
};

export const treeOptions = {
  addIntroElement: true,
  addPolicyElement: true,
  addConfirmationElement: true,
  addSectionTitleElements: false,
  reviewGroup: false,
  headless: true,
};

/**
 * Helper to prepare initial tree state from store
 */
export const getInitialTreeState = (selectedElementId?: number) => ({
  expandedItems: [] as string[],
  selectedItems: selectedElementId ? [String(selectedElementId)] : ([] as string[]),
});

export const createTreeItem = (itemId: string) => {
  return {
    index: itemId,
    canMove: false,
    canRename: false,
    data: { titleEn: "", titleFr: "" },
    children: [],
    isFolder: false,
  };
};
