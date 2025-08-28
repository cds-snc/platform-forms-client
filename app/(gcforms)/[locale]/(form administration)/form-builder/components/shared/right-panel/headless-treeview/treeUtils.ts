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

/**
 * Helper to safely get element ID from tree selection
 */
export const getSelectedElementId = (selectedItems: TreeItemIndex[]): number | undefined => {
  if (selectedItems.length === 0) return undefined;

  const elementId = treeIdToElementId(selectedItems[0]);
  return elementId || undefined;
};

/**
 * Helper to prepare initial tree state from store
 */
export const getInitialTreeState = (selectedElementId?: number) => ({
  expandedItems: [] as TreeItemIndex[],
  selectedItems: selectedElementId
    ? [elementIdToTreeId(selectedElementId)]
    : ([] as TreeItemIndex[]),
});
