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
 * Helper to prepare initial tree state from store
 */
export const getInitialTreeState = (selectedElementId?: number) => ({
  expandedItems: [] as string[],
  selectedItems: selectedElementId ? [String(selectedElementId)] : ([] as string[]),
});
